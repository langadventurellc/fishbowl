#!/usr/bin/env node

/**
 * BDD Specification Extractor
 *
 * Extracts plain text specifications from BDD test files and saves them
 * in a structured format in the project root.
 *
 * Usage: node scripts/extract-bdd-specifications.js
 */

const fs = require("fs");
const path = require("path");

const FEATURES_DIR = "packages/shared/src/__tests__/integration/features";
const OUTPUT_DIR = "extracted-specifications";

/**
 * Recursively finds all .spec.ts files in the features directory
 */
function findSpecFiles(dir) {
  const specFiles = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (
        item.endsWith(".spec.ts") ||
        item.endsWith(".integration.spec.ts")
      ) {
        specFiles.push(fullPath);
      }
    }
  }

  traverse(dir);
  return specFiles;
}

/**
 * Extracts BDD specifications from a test file
 */
function extractSpecifications(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const specifications = {
    fileInfo: {
      path: filePath,
      relativePath: path.relative(process.cwd(), filePath),
      extractedAt: new Date().toISOString(),
    },
    fileDescription: "",
    features: [],
    scenarios: [],
  };

  // Extract file description from fileoverview comment
  const fileOverviewMatch = content.match(
    /\/\*\*\s*\n\s*\*\s*@fileoverview\s+([\s\S]*?)\*\//,
  );
  if (fileOverviewMatch) {
    specifications.fileDescription = fileOverviewMatch[1]
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, "").trim())
      .filter((line) => line && !line.startsWith("*"))
      .join("\n")
      .trim();
  }

  let currentFeature = null;
  let currentScenario = null;
  let currentTest = null;
  let inGivenWhenThen = false;
  let currentSection = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract Feature descriptions
    if (line.includes('describe("Feature:')) {
      const featureMatch = line.match(/describe\("Feature:\s*([^"]+)"/);
      if (featureMatch) {
        currentFeature = {
          name: featureMatch[1].trim(),
          description: "",
          scenarios: [],
        };
        specifications.features.push(currentFeature);
      }
    }

    // Extract Scenario descriptions
    if (line.includes('describe("Scenario:')) {
      const scenarioMatch = line.match(/describe\("Scenario:\s*([^"]+)"/);
      if (scenarioMatch) {
        currentScenario = {
          name: scenarioMatch[1].trim(),
          tests: [],
        };
        specifications.scenarios.push(currentScenario);
        if (currentFeature) {
          currentFeature.scenarios.push(currentScenario);
        }
      }
    }

    // Extract test descriptions (it blocks) - handle multiline test definitions
    if (line.includes("it.skip(") || line.includes("it(")) {
      // Look for test name in current line
      let testMatch = line.match(/it(?:\.skip)?\(\s*"([^"]+)"/);

      // If not found on current line, look ahead for the test name
      if (!testMatch && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        testMatch = nextLine.match(/"([^"]+)"/);
      }

      if (testMatch) {
        currentTest = {
          name: testMatch[1].trim(),
          isSkipped: line.includes("it.skip("),
          givenWhenThen: {
            given: [],
            when: [],
            then: [],
          },
          rawSpecification: [],
        };

        if (currentScenario) {
          currentScenario.tests.push(currentTest);
        }

        inGivenWhenThen = true;
        currentSection = "";
      }
    }
  }

  return specifications;
}

/**
 * Formats specifications as plain text with requested format
 */
function formatAsPlainText(specs) {
  let output = "";

  // Features and scenarios
  for (const feature of specs.features) {
    output += `## Feature: ${feature.name}\n\n`;

    for (const scenario of feature.scenarios) {
      output += `Scenario: ${scenario.name}\n`;

      for (const test of scenario.tests) {
        output += `- should ${test.name}\n`;
      }
      output += "\n";
    }
  }

  // Also include scenarios that aren't nested in features
  for (const scenario of specs.scenarios) {
    // Skip if this scenario is already included in a feature
    const isInFeature = specs.features.some((feature) =>
      feature.scenarios.some((featureScenario) => featureScenario === scenario),
    );

    if (!isInFeature) {
      output += `Scenario: ${scenario.name}\n`;

      for (const test of scenario.tests) {
        output += `- should ${test.name}\n`;
      }
      output += "\n";
    }
  }

  return output;
}

/**
 * Main execution function
 */
function main() {
  console.log("🔍 Extracting BDD specifications...");

  const featuresPath = path.join(process.cwd(), FEATURES_DIR);
  const outputPath = path.join(process.cwd(), OUTPUT_DIR);

  // Check if features directory exists
  if (!fs.existsSync(featuresPath)) {
    console.error(`❌ Features directory not found: ${featuresPath}`);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Find all spec files
  const specFiles = findSpecFiles(featuresPath);
  console.log(`📁 Found ${specFiles.length} specification files`);

  let totalExtracted = 0;
  let allSpecifications = "";

  // Process each spec file
  for (const specFile of specFiles) {
    try {
      console.log(`📄 Processing: ${path.relative(process.cwd(), specFile)}`);

      const specifications = extractSpecifications(specFile);

      // Format and append to combined output
      const plainTextSpecs = formatAsPlainText(specifications);
      if (plainTextSpecs.trim()) {
        allSpecifications += plainTextSpecs;
      }

      // Count extracted specifications
      const specCount = specifications.features.reduce((count, feature) => {
        return (
          count +
          feature.scenarios.reduce((scenarioCount, scenario) => {
            return scenarioCount + scenario.tests.length;
          }, 0)
        );
      }, 0);

      totalExtracted += specCount;
      console.log(`  ✅ Extracted ${specCount} specifications`);
    } catch (error) {
      console.error(`  ❌ Error processing ${specFile}:`, error.message);
    }
  }

  // Save single combined file
  const outputFilePath = path.join(outputPath, "bdd-specifications.md");
  const finalOutput = `# BDD Specifications\n\nExtracted: ${new Date().toISOString()}\n\n${allSpecifications}`;
  fs.writeFileSync(outputFilePath, finalOutput, "utf8");

  console.log(`\n🎉 Extraction complete!`);
  console.log(`📊 Total specifications extracted: ${totalExtracted}`);
  console.log(`📂 Output file: ${outputFilePath}`);
  console.log(
    `\n💡 You can now review the combined BDD specifications in 'bdd-specifications.md'.`,
  );
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { extractSpecifications, formatAsPlainText };
