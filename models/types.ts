import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  parentId?: ObjectId | null;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  _id?: ObjectId;
  userId: ObjectId;
  folderId?: ObjectId | null;
  name: string;
  content: string;
  type: 'markdown' | 'text';
  path: string;
  createdAt: Date;
  updatedAt: Date;
}
