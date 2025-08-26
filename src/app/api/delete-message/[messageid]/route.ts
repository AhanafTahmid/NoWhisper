import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(request: Request): Promise<Response> {
  // derive messageId from the request URL instead of using the route context param
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const messageId = parts[parts.length - 1];

  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as Record<string, unknown> | undefined;
  if (!session || !user) {
    return new Response(JSON.stringify({ success: false, message: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = (user._id as string | undefined) ?? (user.id as string | undefined);
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid user id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updateResult = await UserModel.updateOne(
      { _id: userId },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: 'Message not found or already deleted', success: false }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ message: 'Message deleted', success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return new Response(JSON.stringify({ message: 'Error deleting message', success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}