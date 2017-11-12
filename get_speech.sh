#!/bin/bash -x                                                                                                                                                                                                                    
if [ $# -ne 1 ];then
  echo "Usage: $0 <text>"
  exit 1
fi

text=$1

. ./env.sh
APIKEY=${DOCOMO_API_KEY}

text='<?xml version="1.0" encoding="utf-8" ?><speak version="1.1"><voice name="nozomi">'${text}'</voice></speak>'
textLen=`echo ${text} | wc -c |  tr -d " " | sed -e 's/\n//g'`
textLen=`expr ${textLen} - 1`
header="-H 'Accept: audio/L16' -H 'Content-Type: application/ssml+xml' -H 'Content-Length: ${textLen}'"
url="https://api.apigw.smt.docomo.ne.jp/aiTalk/v1/textToSpeech?APIKEY=${APIKEY}"


curl -H "Accept: audio/L16" -H "Content-Type: application/ssml+xml" -H "Content-Length: ${textLen}"  -d "${text}" "${url}" > a.raw
sox -t raw -r 16k -e signed -b 16 -B -c 1 a.raw audio/a.wav
rm a.raw
