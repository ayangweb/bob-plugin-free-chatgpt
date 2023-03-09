var { configFileName, readFile, writeFile, deleteFile } = require("./file");

async function request(messages) {
	if (!Array.isArray(messages)) {
		messages = [messages];
	}

	const result = await $http.post({
		url: "https://api.aioschat.com/",
		body: {
			messages,
			model: "gpt-3.5-turbo",
			tokensLength: messages[messages.length - 1].content.length,
		},
		header: {
			"content-type": "application/json",
		},
		timeout: 1000 * 60,
	});

	if (!result?.data) {
		throw new Error();
	}

	const { errorMessage, error, choices } = result.data;

	if (errorMessage || error) throw new Error(errorMessage || error);

	return choices[0].text.replace(/chat\s*gpt/gi, "ChatGPT");
}

function getDirectiveResult(text) {
	const configValue = readFile();

	let message;

	switch (text) {
		case "#模式":
			if (configValue.openConversation) {
				return "当前处于对话模式，有什么可以帮助你的呢？";
			} else {
				return "当前处于翻译模式，我支持很多种语言翻译哦~";
			}

		case "#切换":
			configValue.openConversation = !configValue.openConversation;

			if (configValue.openConversation) {
				message = "已开启对话模式！";
			} else {
				message = "已开启翻译模式！";
			}

			break;

		case "#清除":
			deleteFile();

			return "已清除对话记录，你可以继续聊天。";
	}

	writeFile({
		value: configValue,
		fileName: configFileName,
	});

	return message;
}

module.exports = { request, getDirectiveResult };
