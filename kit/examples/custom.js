import { Tool } from "langchain/tools";

class MyMoveTool extends Tool {
  name = "my_move_tool";
  description = "Description of what your tool does";

  constructor() {
    super();
  }

  async _call(args) {
    // Your tool implementation
    // ...
    return JSON.stringify({ data: "Task Completed" });
  }
}
