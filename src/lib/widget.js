/**
 * Widget Object for 3D Dashboard
 */
const Widget = function () {
  const events = {};
  const widgetUrl = window.location.href;
  const prefs = initializePreferences();

  this.uwaUrl = "./";

  // Add event listener
  this.addEvent = (event, callback) => {
    events[event] = callback;
    if (event === "onLoad") {
      if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", callback);
      } else {
        callback();
      }
    }
  };

  this.addPreference = (pref) => {
    pref.value = pref.defaultValue;
    prefs[pref.name] = pref;
    savePreferences(prefs);
  };

  this.getPreference = (prefName) => prefs[prefName];
  this.getUrl = () => widgetUrl;

  this.getValue = (prefName) => prefs[prefName]?.value;

  this.setValue = (prefName, value) => {
    prefs[prefName].value = value;
    savePreferences(prefs);
  };

  this.setTitle = (title) => {
    document.title = title;
  };

  // Utility functions
  function initializePreferences() {
    let prefsLocal = localStorage.getItem("_prefs_4_Widget_");
    try {
      return prefsLocal ? JSON.parse(prefsLocal) : savePreferences({});
    } catch (error) {
      console.error("[Widget] Error parsing preferences:", error);
      return savePreferences({});
    }
  }

  function savePreferences(data) {
    localStorage.setItem("_prefs_4_Widget_", JSON.stringify(data));
    return data;
  }
};

/**
 * Initialize Widget for 3D Dashboard
 */
export function initWidget(cbOk, cbError) {
  const waitForWidget = (maxTries, callback) => {
    if (window.widget) {
      callback(window.widget);
    } else if (maxTries === 0) {
      console.error("[Widget] Widget object not available after retries.");
      cbError(new Error("Widget object not available."));
    } else {
      setTimeout(() => waitForWidget(maxTries - 1, callback), 500);
    }
  };

  const setPublicPath = () => {
    if (window.widget?.uwaUrl) {
      const path = window.widget.uwaUrl.substring(
        0,
        window.widget.uwaUrl.lastIndexOf("/") + 1
      );
      window.__webpack_public_path__ = path || "./";
    } else {
      console.warn("[Widget] Public path not defined. Falling back to './'.");
      window.__webpack_public_path__ = "./";
    }
  };

  if (window.widget) {
    console.log("[Widget] Using existing widget object.");
    setPublicPath();
    cbOk(window.widget);
  } else {
    waitForWidget(20, (widget) => {
      setPublicPath();
      cbOk(widget);
    });
  }
}

// export default {
//   initWidget,
// };
