import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Note from "@/models/Note";
import Reminder from "@/models/Reminder";
import Document from "@/models/Document";

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    if (query.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query is too long.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [tasks, notes, reminders, documents] = await Promise.all([
      Task.find({
        userId: user.userId,
        $or: [
          { title: regex },
          { description: regex },
        ],
      })
        .select("_id title description completed createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Note.find({
        userId: user.userId,
        $or: [
          { title: regex },
          { content: regex },
        ],
      })
        .select("_id title content createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Reminder.find({
        userId: user.userId,
        $or: [
          { title: regex },
          { description: regex },
        ],
      })
        .select("_id title description date time createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Document.find({
        userId: user.userId,
        name: regex,
      })
        .select("_id name size type createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const results = [
      ...tasks.map((item) => ({
        id: item._id,
        type: "task",
        title: item.title,
        description: item.description || "",
        url: "/tasks",
        createdAt: item.createdAt,
      })),

      ...notes.map((item) => ({
        id: item._id,
        type: "note",
        title: item.title,
        description: item.content?.slice(0, 150) || "",
        url: "/notes",
        createdAt: item.createdAt,
      })),

      ...reminders.map((item) => ({
        id: item._id,
        type: "reminder",
        title: item.title,
        description: item.description || "",
        url: "/reminders",
        createdAt: item.createdAt,
      })),

      ...documents.map((item) => ({
        id: item._id,
        type: "document",
        title: item.name,
        description: "PDF Document",
        url: "/documents",
        createdAt: item.createdAt,
      })),
    ];

    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      results: results.slice(0, 30),
    });
  } catch (error) {
    console.error("GLOBAL SEARCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Search failed. Please try again.",
      },
      { status: 500 }
    );
  }
}