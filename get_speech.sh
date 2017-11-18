#!/bin/bash

# AITalkのAPIを叩いて音声ファイルを取得(バイナリ)し、それをwavファイルに変換して保存

if [ $# -ne 1 ];then
  echo "Usage: $0 <text>"
  exit 1
fi

TEXT=$1

. ./env.sh

APIKEY=${DOCOMO_API_KEY}
SPEAKER=nozomi
SSML='<?xml version="1.0" encoding="utf-8" ?><speak version="1.1"><voice name="'${SPEAKER}'">'${TEXT}'</voice></speak>'

SSML_LENGTH=`echo ${SSML} | wc -c |  tr -d " " | sed -e 's/\n//g'`
SSML_LENGTH=`expr ${SSML_LENGTH} - 1`
echo ${SSML_LENGTH}

URL="https://api.apigw.smt.docomo.ne.jp/aiTalk/v1/textToSpeech?APIKEY=${APIKEY}"

curl -H "Accept: audio/L16" -H "Content-Type: application/ssml+xml" -H "Content-Length: ${SSML_LENGTH}"  -d "${SSML}" "${URL}" > tmp.raw
sox -t raw -r 16k -e signed -b 16 -B -c 1 tmp.raw audio/voice.wav
rm tmp.raw
