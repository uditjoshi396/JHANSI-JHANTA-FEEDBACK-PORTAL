/**
 * Get Modules List for Target Version
 *
 * This utility script retrieves the list of modules (JavaScript files)
 * for a specific target version of the application.
 *
 * Usage:
 *   node get-modules-list-for-target-version.js [version]
 *
 * Examples:
 *   node get-modules-list-for-target-version.js        # Get modules for current version
 *   node get-modules-list-for-target-version.js 1.0.0  # Get modules for version 1.0.0
 *   node get-modules-list-for-target-version.js latest # Get latest modules
 */

const fs = require("fs");
const path = require("path");

// Project configuration
const PROJECT_CONFIG = {
  name: "Janata Feedback Portal",
  currentVersion: "1.0.0",
  versionHistory: [
    { version: "1.0.0", releaseDate: "2024-01-01", modules: ["core"] },
    {
      version: "1.1.0",
      releaseDate: "2024-06-01",
      modules: ["core", "transparency"],
    },
    {
      version: "1.2.0",
      releaseDate: "2024-12-01",
      modules: ["core", "transparency", "ai"],
    },
    {
      version: "2.0.0",
      releaseDate: "2025-01-01",
      modules: ["core", "transparency", "ai", "accountGenerator"],
    },
  ],
};

// Module directories to scan
const MODULE_DIRECTORIES = {
  server: {
    lib: path.join(__dirname, "server", "lib"),
    routes: path.join(__dirname, "server", "routes"),
    models: path.join(__dirname, "server", "models"),
  },
  client: {
    components: path.join(__dirname, "client", "src", "components"),
    pages: path.join(__dirname, "client", "src", "pages"),
    utils: path.join(__dirname, "client", "src", "utils"),
  },
};

/**
 * Get all JavaScript files in a directory
 * @param {string} dirPath - Directory path to scan
 * @param {string} basePath - Base path for relative paths
 * @returns {Array} Array of module objects
 */
function getModulesFromDirectory(dirPath, basePath) {
  const modules = [];

  if (!fs.existsSync(dirPath)) {
    return modules;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && file.endsWith(".js")) {
      modules.push({
        name: file.replace(".js", ""),
        file: file,
        path: path.relative(basePath, filePath),
        fullPath: filePath,
      });
    }
  });

  return modules;
}

/**
 * Get all modules for the target version
 * @param {string} targetVersion - Target version (e.g., '1.0.0', 'latest', 'current')
 * @returns {Object} Object containing modules grouped by category
 */
function getModulesListForTargetVersion(targetVersion = "current") {
  let version = targetVersion;

  // Handle special version keywords
  if (version === "latest" || version === "current") {
    version = PROJECT_CONFIG.currentVersion;
  }

  // Find version in history or use current
  const versionConfig = PROJECT_CONFIG.versionHistory.find(
    (v) => v.version === version,
  ) || {
    version,
    modules:
      PROJECT_CONFIG.versionHistory[PROJECT_CONFIG.versionHistory.length - 1]
        .modules,
  };

  const result = {
    version: version,
    projectName: PROJECT_CONFIG.name,
    scannedAt: new Date().toISOString(),
    modules: {
      server: {
        lib: [],
        routes: [],
        models: [],
      },
      client: {
        components: [],
        pages: [],
        utils: [],
      },
    },
    totalModules: 0,
  };

  // Scan server directories
  const serverBasePath = path.join(__dirname, "server");
  result.modules.server.lib = getModulesFromDirectory(
    MODULE_DIRECTORIES.server.lib,
    serverBasePath,
  );
  result.modules.server.routes = getModulesFromDirectory(
    MODULE_DIRECTORIES.server.routes,
    serverBasePath,
  );
  result.modules.server.models = getModulesFromDirectory(
    MODULE_DIRECTORIES.server.models,
    serverBasePath,
  );

  // Scan client directories
  const clientBasePath = path.join(__dirname, "client", "src");
  result.modules.client.components = getModulesFromDirectory(
    MODULE_DIRECTORIES.client.components,
    clientBasePath,
  );
  result.modules.client.pages = getModulesFromDirectory(
    MODULE_DIRECTORIES.client.pages,
    clientBasePath,
  );
  result.modules.client.utils = getModulesFromDirectory(
    MODULE_DIRECTORIES.client.utils,
    clientBasePath,
  );

  // Count total modules
  result.totalModules =
    result.modules.server.lib.length +
    result.modules.server.routes.length +
    result.modules.server.models.length +
    result.modules.client.components.length +
    result.modules.client.pages.length +
    result.modules.client.utils.length;

  return result;
}

/**
 * Print modules in a formatted way
 * @param {Object} modulesData - Modules data object
 */
function printModules(modulesData) {
  console.log("\n" + "=".repeat(60));
  console.log(`📦 Modules List for ${modulesData.projectName}`);
  console.log(`📋 Version: ${modulesData.version}`);
  console.log(`🕐 Scanned at: ${modulesData.scannedAt}`);
  console.log("=".repeat(60));

  console.log("\n🔧 Server Modules:");

  console.log(`  📁 lib/ (${modulesData.modules.server.lib.length} modules)`);
  modulesData.modules.server.lib.forEach((m) => {
    console.log(`     - ${m.file}`);
  });

  console.log(
    `  📁 routes/ (${modulesData.modules.server.routes.length} modules)`,
  );
  modulesData.modules.server.routes.forEach((m) => {
    console.log(`     - ${m.file}`);
  });

  console.log(
    `  📁 models/ (${modulesData.modules.server.models.length} modules)`,
  );
  modulesData.modules.server.models.forEach((m) => {
    console.log(`     - ${m.file}`);
  });

  console.log("\n🌐 Client Modules:");

  console.log(
    `  📁 components/ (${modulesData.modules.client.components.length} modules)`,
  );
  modulesData.modules.client.components.forEach((m) => {
    console.log(`     - ${m.file}`);
  });

  console.log(
    `  📁 pages/ (${modulesData.modules.client.pages.length} modules)`,
  );
  modulesData.modules.client.pages.forEach((m) => {
    console.log(`     - ${m.file}`);
  });

  console.log(
    `  📁 utils/ (${modulesData.modules.client.utils.length} modules)`,
  );
  modulesData.modules.client.utils.forEach((m) => {
    console.log(`     - ${m.file}`);
  });

  console.log("\n" + "-".repeat(60));
  console.log(`📊 Total Modules: ${modulesData.totalModules}`);
  console.log("=".repeat(60) + "\n");
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const targetVersion = args[0] || "current";

  console.log(`\n🔍 Fetching modules for version: ${targetVersion}`);

  try {
    const modulesData = getModulesListForTargetVersion(targetVersion);
    printModules(modulesData);

    // Also output as JSON for programmatic use
    if (args.includes("--json")) {
      console.log("\n📄 JSON Output:");
      console.log(JSON.stringify(modulesData, null, 2));
    }

    // Export for programmatic use
    module.exports = {
      getModulesListForTargetVersion,
      getModulesFromDirectory,
      PROJECT_CONFIG,
      MODULE_DIRECTORIES,
    };
  } catch (error) {
    console.error("❌ Error getting modules:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  getModulesListForTargetVersion,
  getModulesFromDirectory,
  PROJECT_CONFIG,
  MODULE_DIRECTORIES,
};
