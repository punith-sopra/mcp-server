/**
 * Mock Setup for Local Development
 */
if (!window.widget) {
  console.log("[Local Mock] Creating mock widget object...");
  const Widget = function () {
    const events = {};
    this.uwaUrl = window.location.origin + "/";
    this.addEvent = (event, callback) => {
      console.log(`[Local Mock] Event registered: ${event}`);
      events[event] = callback;
      if (event === "onLoad") {
        if (document.readyState === "loading") {
          window.addEventListener("DOMContentLoaded", callback);
        } else {
          callback();
        }
      }
    };
    this.setTitle = (title) => {
      document.title = title;
    };
    this.dispatchEvent = (event, data) => {
      console.log(`[Local Mock] Dispatching event: ${event} with data:`, data);
      if (events[event]) events[event](data);
    };
  };
  window.widget = new Widget();
  console.log("[Local Mock] Mock widget created:", window.widget);
}

// Mock `define` function for RequireJS
if (typeof window.define === "undefined") {
  console.log("[Local Mock] Mocking define function...");
  window.define = (name, deps, callback) => {
    if (typeof deps === "function") {
      callback = deps;
    }
    console.log(`[Local Mock] Defining module: ${name}`);
    if (name === "DS/DataDragAndDrop/DataDragAndDrop") {
      callback(window.DataDragAndDrop);
    } else if (name === "DS/WAFData/WAFData") {
      callback(window.WAFData);
    } else {
      callback({});
    }
  };
  window.define.amd = true;
}

// Mock `require` function
if (!window.require) {
  console.log("[Local Mock] Creating mock require function...");
  window.require = (modules, callback) => {
    console.log("[Local Mock] Resolving modules:", modules);
    const resolvedModules = modules.map((module) => {
      if (module === "DS/WAFData/WAFData") return window.WAFData;
      if (module === "DS/DataDragAndDrop/DataDragAndDrop") return window.DataDragAndDrop;
      if (module === "DS/i3DXCompassServices/i3DXCompassServices") return window.i3DXCompassServices;
      return {};
    });
    callback(...resolvedModules);
  };
}

// Mock `WAFData`
if (!window.WAFData) {
  console.log("[Local Mock] Mocking WAFData...");
  window.WAFData = {
    authenticatedRequest: (url, options) => {
      console.log(`[Local Mock] WAFData.authenticatedRequest called with URL: ${url}`, options);
      setTimeout(() => {
        if (url.includes("CSRF")) {
          options.onComplete && options.onComplete({
            csrf: { name: "mock-csrf-token", value: "mock-csrf-value" },
          });
        } else {
          options.onComplete && options.onComplete({ mockData: "Sample response data" });
        }
      }, 300); // Simulate delay for realistic testing
    },
  };
}

// Mock `DataDragAndDrop`
if (!window.DataDragAndDrop) {
  console.log("[Local Mock] Mocking DataDragAndDrop...");
  window.DataDragAndDrop = {
    droppable: (element, callbacks) => {
      console.log("[Local Mock] Initializing droppable area:", element);
      element.addEventListener("dragenter", (e) => {
        e.preventDefault();
        callbacks.enter && callbacks.enter(e);
      });
      element.addEventListener("dragleave", (e) => {
        e.preventDefault();
        callbacks.leave && callbacks.leave(e);
      });
      element.addEventListener("drop", (e) => {
        e.preventDefault();
        const mockData = JSON.stringify({
          data: { items: [{ objectId: "mock-object-id", displayName: "Mock Object" }] },
        });
        callbacks.drop && callbacks.drop(mockData);
      });
    },
  };
}

if (!window.i3DXCompassServices) {
  console.log("[Local Mock] Mocking i3DXCompassServices...");
  window.i3DXCompassServices = {
    getServiceUrl: (options) => { 
      options.onComplete && options.onComplete({
        data: { name: "space", value: "space_url" },
      })
    },
  };
}


console.log("[Local Mock] Environment initialized successfully.");
