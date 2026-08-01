#!/usr/bin/env python3
"""Generate the formal Follow My Face poster via Aigram transit."""
import io, json, time, urllib.error, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ENDPOINT = 'https://chat.aiwaves.tech/aigram/api/gen-image'
SOURCE = ROOT / '_production' / 'poster-source.webp'
OUTPUT = ROOT / 'public' / 'poster.png'
PROVENANCE = ROOT / '_production' / 'poster-provenance.json'
PROMPT = """Refine the supplied square 1970s television game-show poster. Preserve the exact same curly-haired white male contestant, his alarmed funny face, his arm pointing LEFT, the red left door, blue right door, tactile cream cardboard walls, and the giant mustard arrow pointing RIGHT. Preserve exactly one perfectly spelled title FOLLOW MY FACE in huge bold black letters across the upper safe area. Remove the number 22 from the arrow and leave that part plain yellow. Completely remove the black pseudo-writing and numbers from the upper-right corner. Completely remove the white badge, arrows, numbers, smiley, microphone and podium from the bottom. Replace the lower 22 percent with quiet empty cream/red/blue cardboard floor texture containing no objects. Allow absolutely no text, letters, numbers, glyphs, logos or pseudo-writing anywhere except the single title FOLLOW MY FACE. No Chinese, no watermark, no phone, no app UI. Keep the man's face and the red-versus-blue contradiction crisp at 160x160."""

def request_image():
    previous = json.loads(PROVENANCE.read_text(encoding='utf-8')) if PROVENANCE.exists() else {}
    request_body = {'prompt': PROMPT}
    if previous.get('result_url'):
        request_body['ref_url'] = previous['result_url']
    body = json.dumps(request_body).encode()
    for attempt, delay in enumerate((0, 3, 8, 15), 1):
        if delay:
            time.sleep(delay)
        req = urllib.request.Request(ENDPOINT, data=body, headers={
            'Content-Type': 'application/json', 'Origin': 'https://aigram.app', 'User-Agent': 'Mozilla/5.0'
        }, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=360) as response:
                payload = json.load(response)
            url = payload.get('url') or payload.get('data', {}).get('url')
            if not url:
                raise RuntimeError(f'missing url: {payload}')
            return url, request_body.get('ref_url')
        except urllib.error.HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise
    raise RuntimeError('unreachable')

def main():
    url, ref_url = request_image()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=120) as response:
        raw = response.read()
    SOURCE.write_bytes(raw)
    image = Image.open(io.BytesIO(raw)).convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
    image.save(OUTPUT, 'PNG', optimize=True)
    PROVENANCE.write_text(json.dumps({
        'endpoint': ENDPOINT, 'origin': 'https://aigram.app', 'prompt': PROMPT,
        'ref_url': ref_url, 'result_url': url,
        'source': '_production/poster-source.webp', 'output': 'public/poster.png'
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'url': url, 'size': image.size, 'output': str(OUTPUT)}))

if __name__ == '__main__':
    main()
