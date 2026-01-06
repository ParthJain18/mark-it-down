import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { Folder } from '@/models/types';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const folders = await db.collection<Folder>('folders')
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ path: 1 })
      .toArray();

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
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

    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    let path = `/${name}`;
    if (parentId) {
      const parentFolder = await db.collection<Folder>('folders').findOne({
        _id: new ObjectId(parentId),
        userId: new ObjectId(session.user.id)
      });

      if (parentFolder) {
        path = `${parentFolder.path}/${name}`;
      }
    }

    const folder: Omit<Folder, '_id'> = {
      userId: new ObjectId(session.user.id),
      name,
      parentId: parentId ? new ObjectId(parentId) : null,
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Folder>('folders').insertOne(folder as Folder);

    return NextResponse.json(
      { folder: { ...folder, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
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

    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Folder ID and name are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get the folder
    const folder = await db.collection<Folder>('folders').findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id)
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Update path
    const pathParts = folder.path.split('/');
    pathParts[pathParts.length - 1] = name;
    const newPath = pathParts.join('/');

    // Update the folder
    await db.collection<Folder>('folders').updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(session.user.id)
      },
      {
        $set: {
          name,
          path: newPath,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({ message: 'Folder updated successfully' });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
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
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Delete the folder
    const result = await db.collection<Folder>('folders').deleteOne({
      _id: new ObjectId(folderId),
      userId: new ObjectId(session.user.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Also delete files in this folder
    await db.collection('files').deleteMany({
      folderId: new ObjectId(folderId),
      userId: new ObjectId(session.user.id)
    });

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
