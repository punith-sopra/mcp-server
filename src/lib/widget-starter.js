import { initWidget } from "./widget";

initWidget((widget) => {
    import("../index")
      .then((module) => {
        module.default();
      })
      .catch((error) => {
        console.error("Error dynamically importing ../index:", error);
        // Handle the error appropriately, e.g., display an error message to the user:
        widget.body.innerHTML = "<div style='color: red;'>Error loading widget content.</div>";
      });
  });