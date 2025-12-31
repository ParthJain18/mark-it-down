import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { File } from '@/models/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    const db = await getDb();

    if (fileId) {
      // Get single file
      const file = await db.collection<File>('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(session.user.id)
      });

      if (!file) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ file });
    }

    // Get all files
    const files = await db.collection<File>('files')
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ path: 1 })
      .toArray();

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, content, type, folderId } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'File name and type are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    let path = `/${name}`;
    if (folderId) {
      const folder = await db.collection('folders').findOne({
        _id: new ObjectId(folderId),
        userId: new ObjectId(session.user.id)
      });
      
      if (folder) {
        path = `${folder.path}/${name}`;
      }
    }

    const file: Omit<File, '_id'> = {
      userId: new ObjectId(session.user.id),
      folderId: folderId ? new ObjectId(folderId) : null,
      name,
      content: content || '',
      type: type === 'markdown' ? 'markdown' : 'text',
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<File>('files').insertOne(file as File);

    return NextResponse.json(
      { file: { ...file, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, content, name } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (content !== undefined) {
      updateData.content = content;
    }

    if (name !== undefined) {
      updateData.name = name;
      
      // Update path if name changes
      const file = await db.collection<File>('files').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(session.user.id)
      });
      
      if (file) {
        const pathParts = file.path.split('/');
        pathParts[pathParts.length - 1] = name;
        updateData.path = pathParts.join('/');
      }
    }

    const result = await db.collection<File>('files').updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(session.user.id)
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const result = await db.collection<File>('files').deleteOne({
      _id: new ObjectId(fileId),
      userId: new ObjectId(session.user.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
