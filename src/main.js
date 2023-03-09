var { languages, getLanguageName } = require("./language");
var { historyFileName, readFile, writeFile } = require("./file");
var { request, getDirectiveResult } = require("./utils");

function supportLanguages() {
	return languages.map(([language]) => language);
}

async function translate(query, completion) {
	try {
		const { text, detectFrom: from, detectTo: to } = query;

		const content = text.replace(/chatgpt/gi, "Chat GPT");

		const fromName = getLanguageName(from);
		const toName = getLanguageName(to);

		// 返回结果
		const completionResult = (result) => {
			completion({
				result: {
					from,
					to,
					toParagraphs: result.split("\n"),
				},
			});
		};

		// 触发指令的结果
		const directiveResult = getDirectiveResult(content);
		if (directiveResult) {
			completionResult(directiveResult);

			return;
		}

		// 读取 config 内容
		const { openConversation } = readFile();

		let message = { content, role: "user" };

		if (openConversation) {
			message = readFile(historyFileName).concat(message);
		} else {
			message.content = `请将以下${fromName}内容翻译成${toName}，并保留原文中的回车格式：\n${content}`;
		}

		// 获取对话结果
		const chatResult = await request(message);

		// 对话模式就保存
		if (openConversation) {
			message.push({
				content: chatResult,
				role: "assistant",
			});

			writeFile({
				value: message,
				fileName: historyFileName,
			});
		}

		completionResult(chatResult);
	} catch ({ message }) {
		completion({
			error: {
				type: "unknow",
				message,
			},
		});
	}
}

module.exports = {
	supportLanguages,
	translate,
};
