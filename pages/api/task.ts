import type { NextApiRequest, NextApiResponse } from "next";
import { DefaultResponseMsg } from "../../types/DefaultResponseMsg";
import connectDB from "../../middlewares/connectDB";
import jwtValidator from "../../middlewares/jwtValidator";
import { Task } from "../../types/Task";
import { TaskModel } from "../../models/TaskModel";
import { UserModel } from "../../models/UserModel";
import { GetTasksQueryParams } from "../../types/GetTasksQueryParams";
import moment from "moment";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg | Task[]>
) => {
  try {
    const userId = req?.body?.userId
      ? req?.body?.userId
      : (req?.query?.userId as string);
    const failedValidation = await validateUser(userId);
    if (failedValidation) {
      return res.status(400).json({ error: failedValidation });
    }

    if (req.method === "POST") {
      return await saveTask(req, res, userId);
    } else if (req.method === "GET") {
      return await getTasks(req, res, userId);
    } else if (req.method === "PUT") {
      return await updateTask(req, res, userId);
    } else if (req.method === "DELETE") {
      return await deleteTask(req, res, userId);
    }

    res.status(400).json({ error: "Method does not exist" });
  } catch (e) {
    console.log("Error to manage tasks: ", e);
    res.status(500).json({ error: "Error to manage tasks, try again!" });
  }
};

const validateTaskAndReturnValue = async (
  req: NextApiRequest,
  userId: string
) => {
  const id = req.query?.id as string;

  if (!id || id.trim() === "") {
    return null;
  }

  const taskFound = await TaskModel.findById(id);
  if (!taskFound || taskFound.userId !== userId) {
    return null;
  }

  return taskFound;
};

const updateTask = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg | Task[]>,
  userId: string
) => {
  const taskFound = await validateTaskAndReturnValue(req, userId);
  if (!taskFound) {
    return res.status(400).json({ error: "Task not found" });
  }

  if (req.body) {
    const task = req.body as Task;

    if (task.name && task.name.trim() !== "") {
      taskFound.name = task.name;
    }

    if (task.finishPrevisionDate) {
      taskFound.finishPrevisionDate = task.finishPrevisionDate;
    }

    if (task.finishDate) {
      taskFound.finishDate = task.finishDate;
    }

    await TaskModel.findByIdAndUpdate({ _id: taskFound._id }, taskFound);
    return res.status(200).json({ msg: "Success to update task" });
  }

  return res.status(400).json({ error: "Invalid input parameters" });
};

const deleteTask = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg | Task[]>,
  userId: string
) => {
  const taskFound = await validateTaskAndReturnValue(req, userId);
  if (!taskFound) {
    return res.status(400).json({ error: "Task not found" });
  }

  await TaskModel.findByIdAndDelete({ _id: taskFound._id });
  return res.status(200).json({ msg: "Success to delete task" });
};

const getTasks = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg | Task[]>,
  userId: string
) => {
  const params = req.query as GetTasksQueryParams;

  const query = {
    userId,
  } as any;

  if (params?.finishPrevisionStart) {
    const inputDate = new Date(params?.finishPrevisionStart);
    query.finishPrevisionDate = { $gte: inputDate };
  }

  if (params?.finishPrevisionEnd) {
    const lastDate = new Date(params?.finishPrevisionEnd);
    if (!query.finishPrevisionDate) {
      query.finishPrevisionDate = {};
    }
    query.finishPrevisionDate.$lte = lastDate;
  }

  if (params?.status) {
    const status = parseInt(params?.status);
    switch (status) {
      case 1:
        query.finishDate = null;
        break;
      case 2:
        query.finishDate = { $ne: null };
        break;
      default:
        break;
    }
  }

  const result = (await TaskModel.find(query)) as Task[];
  return res.status(200).json(result);
};

const validateUser = async (userId: string) => {
  if (!userId) {
    return "User not informed";
  }

  const userFound = await UserModel.findById(userId);
  if (!userFound) {
    return "User not found";
  }
};

const saveTask = async (
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponseMsg>,
  userId: string
) => {
  if (req.body) {
    const task = req.body as Task;
    if (!task.name || task.name.length < 2) {
      return res.status(400).json({ error: "Invalid task name" });
    }
    const ifObsoleteDate = moment(task.finishPrevisionDate).isBefore(moment());

    if (
      !task.finishPrevisionDate ||
      ifObsoleteDate
    ) {
      return res
        .status(400)
        .json({ error: "Prevision date invalid or less than today" });
    }

    const final = {
      ...task,
      userId,
      finishDate: undefined,
    } as Task;

    await TaskModel.create(final);
    return res.status(200).json({ msg: "Success to create task" });
  }

  return res.status(400).json({ error: "Invalid input parameters" });
};

export default connectDB(jwtValidator(handler));
