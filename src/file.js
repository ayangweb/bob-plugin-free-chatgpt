// 配置文件名称
const configFileName = ".config.dat";

// 历史对话文件名称
const historyFileName = ".history.dat";

function getFilePath(fileName) {
	return `$sandbox/${fileName}`;
}

function readFile(fileName = configFileName) {
	const filePath = getFilePath(fileName);

	const exists = $file.exists(filePath);

	if (!exists) {
		return fileName === configFileName ? { openConversation: false } : [];
	}

	return JSON.parse($file.read(filePath).toUTF8());
}

function writeFile({ value, fileName = configFileName }) {
	$file.write({
		data: $data.fromUTF8(JSON.stringify(value)),
		path: getFilePath(fileName),
	});
}

function deleteFile(fileName = historyFileName) {
	$file.delete(getFilePath(fileName));
}

module.exports = {
	configFileName,
	historyFileName,
	readFile,
	writeFile,
	deleteFile,
};
