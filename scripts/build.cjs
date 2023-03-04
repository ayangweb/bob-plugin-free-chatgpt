const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const crypto = require("crypto");
const { name, version } = require("../package.json");

const SRC_DIR = path.join(__dirname, "../src");

const PLUGIN_DIR = path.join(__dirname, `../release/${name}.bobplugin`);

const GITHUB_REPOSITORY = "https://github.com/bilibili-ayang/" + name;

const updateVersion = (dir) => {
	dir = path.join(__dirname, dir);

	if (path.extname(dir) === ".md") {
		let file = fs.readFileSync(dir, "utf8");

		file = file.replace(/v\d+\.\d+\.\d+/g, `v${version}`);

		fs.writeFileSync(dir, file);
	} else {
		let file = fs.readJsonSync(dir);

		if (file?.versions) {
			const zip = new AdmZip();

			const files = fs.readdirSync(SRC_DIR);

			for (const file of files) {
				zip.addLocalFile(`${SRC_DIR}/${file}`);
			}

			zip.writeZip(PLUGIN_DIR);

			if (file.versions.find((item) => item.version === version)) return;

			const sha256 = crypto
				.createHash("sha256")
				.update(fs.readFileSync(PLUGIN_DIR))
				.digest("hex")
				.toString();

			file.versions.unshift({
				version,
				desc: `${GITHUB_REPOSITORY}/blob/master/CHANGELOG.md`,
				sha256,
				url: `${GITHUB_REPOSITORY}/releases/download/v${version}/${name}.bobplugin`,
				minBobVersion: "0.5.0",
			});
		} else {
			file.version = version;
		}

		fs.outputJSONSync(dir, file, { spaces: 2 });
	}
};

// 更新 info.json
updateVersion("../src/info.json");

// 更新 README.md
updateVersion("../README.md");

// 更新 appcast.json
updateVersion("../appcast.json");
