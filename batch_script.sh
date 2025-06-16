for ((i = 0; i < 1000; i++)); do
  echo "$i"
curl 'http://localhost:3000/api/flashcards' \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:4200' \
  -H 'Connection: keep-alive' \
  -H 'Referer: http://localhost:4200/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Priority: u=0' \
  --data-raw "{\"term\":\"Hello\",\"definition\":\"World - ${i}!\"}"
done

