import { isURL } from '@/shared/url';

export const getLinkWithTitle = (event) => {
  const pastedString = event.clipboardData.getData('text/plain');

  // クリップボードの内容がURLの場合、`[title](url)`形式で返却する
  if (!isURL(pastedString)) return;

  event.preventDefault();

  return fetch(pastedString, {
    method: 'get',
  })
    .then((res) => res.text())
    .then((text) => new DOMParser().parseFromString(text, 'text/html'))
    .then((parsedBody) => `[${parsedBody.title}](${pastedString})`)
    .catch((e) => {
      // 見つからない場合は貼り付けたテキストをそのまま挿入
      return pastedString;
    });
};
