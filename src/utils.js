var { configFileName, readFile, writeFile, deleteFile } = require("./file");

async function request(messages) {
	if (!Array.isArray(messages)) {
		messages = [messages];
	}

	const result = await $http.post({
		url: "https://chatgpt.ddiu.me/api/generate",
		body: {
			messages,
		},
		header: {
			"content-type": "application/json",
		},
		timeout: 1000 * 60,
	});

	if (!result?.data) {
		throw new Error();
	}

	$log.info(result?.data);

	return result.data;
}

function getDirectiveResult(text) {
	const configValue = readFile();

	let tips;

	switch (text) {
		case "#模式":
			return `当前处于${
				configValue.openConversation
					? "对话模式，你有什么问题要问我吗？"
					: "翻译模式，我支持很多种语言翻译哦~"
			}`;
		case "#切换":
			configValue.openConversation = !configValue.openConversation;

			tips = configValue.openConversation
				? "已开启对话模式！"
				: "已开启翻译模式！";

			break;
		case "#清除":
			deleteFile();

			return "已清除对话记录，你可以继续聊天。";
	}

	writeFile({
		value: configValue,
		fileName: configFileName,
	});

	return tips;
}

module.exports = { request, getDirectiveResult };
