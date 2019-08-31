# r326-gcal
![MIT License](https://img.shields.io/badge/license-MIT-blue)
![dependencies](https://david-dm.org/clab-team/r326-gcal.svg)
![devDependencies](https://david-dm.org/clab-team/r326-gcal/dev-status.svg)

[「りざぶ郎」](https://r326.com)に登録された予定をGoogle Calendarに同期するスクリプト

## Live Demo
筑波大学春日エリア 情報メディアユニオン クリエイティブメディアラボの予約票

* [りざぶ郎](https://www.r326.com/b/main.aspx?id=clab)
* [Google Calendar](https://calendar.google.com/calendar/embed?src=q2thfrpju4gmkrqcrpq83gpe5k%40group.calendar.google.com&ctz=Asia%2FTokyo)

## Usage
:warning: このスクリプトは、実行時点でりざぶ郎に存在しない予定をGoogleカレンダーから消去します。 **既存のGoogleカレンダーに誤って連携し、予定を消去することのないようにご注意ください。**

---
`r326-gcal`は、[Google Apps Script](https://script.google.com)を基盤として動作します。Googleサービスへのログインを簡素化できる他、定期実行が簡単に設定できる利点があります。


デプロイのために[Node.js](https://nodejs.org/ja/)および[yarn](https://yarnpkg.com/lang/ja/)を利用します。

```shell
# 依存パッケージのインストール
$ yarn

# Google Apps Scriptを操作するclaspのログイン操作
$ npx clasp login

# - claspで新規にGoogle Apps Scriptのプロジェクトを作成、割り当て
#   プロジェクトタイプを選択する必要がある場合は "standalone" を選びます
npx clasp create [PROJECT_NAME] --rootDir src

# デプロイ
# - Google Apps Scriptにデプロイが行われます
$ yarn deploy
```
* 以下の値をScriptProperties（ファイル->プロジェクトのプロパティ）に追加してください。
  * `r326Id`: りざぶ郎の予定表ID(`https://r326.com/b/a.aspx?id=`に続く値)
  * `calendarId`: GoogleカレンダーのID（個々のカレンダーの設定画面にある、Eメールアドレスの形をした文字列）
* [script.google.com](https://script.google.com)から、`index.gs`に含まれる関数`sync`を実行することで、同期が行われます。
  * 初回の実行を行う際に、プロジェクトを作成したアカウントへの認証が行われます。
* Google Apps Scriptのコンソールからトリガーを作成することで定期実行を行うことができます。

## dev
```
# コードのLintにESLintを導入しています。
$ yarn lint
$ yarn lint --fix
```
