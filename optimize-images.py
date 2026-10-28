from PIL import Image, ImageOps
from pathlib import Path
assets = Path('public/images')
for source in assets.glob('*.jpg'):
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    image.thumbnail((1100, 1100) if source.stem == 'central-star-photo' else (240, 240), Image.Resampling.LANCZOS)
    target = source.with_suffix('.webp')
    image.save(target, 'WEBP', quality=82, method=6)
    print(f'{source.name}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes')
    if source.stem == 'central-star-photo':
        image.thumbnail((360, 360), Image.Resampling.LANCZOS)
        image.save(assets / 'central-star-thumb.webp', 'WEBP', quality=82, method=6)
