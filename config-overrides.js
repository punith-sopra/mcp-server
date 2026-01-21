const path = require("path");
const {
  override,
  addWebpackAlias,
  addWebpackPlugin,
} = require("customize-cra");
const webpack = require("webpack");

module.exports = override(
  addWebpackAlias({
    "@components": path.resolve(__dirname, "src/components/"),
    "@hooks": path.resolve(__dirname, "src/hooks/"),
    "@pages": path.resolve(__dirname, "src/pages/"),
    "@utils": path.resolve(__dirname, "src/utils/"),
    // Add more aliases as needed
  }),
  (config) => {
    // Update the entry based on the WIDGET_ENTRY environment variable.
    if (process.env.WIDGET_ENTRY === "revisionFloat") {
      config.entry = {
        main: "./src/index.js", // Entry for Revision Float widget
      };
    } else if (process.env.WIDGET_ENTRY === "plantAssignment") {
      config.entry = {
        main: "./src/plantIndex.js", // Entry for Plant Assignment widget
      }
    } else if (process.env.WIDGET_ENTRY === "cloneRouteTemplate") {
        config.entry = {
          main: "./src/routeTemplateIndex.js", // Entry for Plant Assignment widget
        };
    }

    // Remove the DefinePlugin that sets process.env.WIDGET_ENTRY if it exists
    config.plugins = config.plugins.filter(
      (plugin) => !(plugin instanceof webpack.DefinePlugin)
    );

    // Define externals for the 3DEXPERIENCE modules
    config.externals = {
      "DS/DataDragAndDrop/DataDragAndDrop":
        "DS/DataDragAndDrop/DataDragAndDrop",
      "DS/PlatformAPI/PlatformAPI": "DS/PlatformAPI/PlatformAPI",
      "DS/TagNavigatorProxy/TagNavigatorProxy":
        "DS/TagNavigatorProxy/TagNavigatorProxy",
        "DS/WAFData/WAFData": "DS/WAFData/WAFData",
      "UWA/Utils/InterCom": "UWA/Utils/InterCom",
      "DS/i3DXCompassServices/i3DXCompassServices":
        "DS/i3DXCompassServices/i3DXCompassServices",
    };

    return config;
  }
);