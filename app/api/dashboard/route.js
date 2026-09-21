import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const tasks = await Task.find({
      userId: user.userId,
    }).sort({
      createdAt: -1,
    });

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.completed
    ).length;

    const pendingTasks = tasks.filter(
      (task) => !task.completed
    ).length;

    const today = new Date();

    const todayTasks = tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      return (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate()
      );
    });

    return Response.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
      },
      todayTasks,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}