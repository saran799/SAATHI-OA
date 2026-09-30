# SIH presentation graphics

Slide graphics for the SAATHI Smart India Hackathon (SIH) deck, generated with
`scripts/make_sih_slides.py` (Pillow + DejaVu Sans; palette taken from the app
design system: primary `#00685F`, mint `#99EFE5` / `#D5F8F5`, background `#F8F9FF`).

| File | Size | Use |
| --- | --- | --- |
| `sih-textbox.png` | 2480 x 1508 | The text box alone, on a **transparent** background - drop it onto any slide and add your own text around it |
| `sih-textbox-slide.png` | 1920 x 1080 (16:9) | Ready-made slide whose hero element is the text box, with the SAATHI logo panel on the right |
| `sih-title-slide.png` | 1920 x 1080 (16:9) | Title slide: logo mark, wordmark, tagline, category chip and the screening disclaimer |

## Editing the text

All copy lives in the `CONTENT` dict at the top of `scripts/make_sih_slides.py`
(event name, title, subtitle, tagline, chip, bullets, footer, disclaimer).
Change it and re-run:

```bash
python3 scripts/make_sih_slides.py     # needs Pillow; DejaVu ships with matplotlib
```

Font sizes, paddings and colours are constants in the same file if you need to
retune the layout.

## Using them in PowerPoint / Google Slides

- Insert the PNG as a picture (Insert > Picture), then place it full-bleed on a
  blank 16:9 slide.
- The transparent `sih-textbox.png` can be layered over your own backgrounds,
  photos or brand colours.
- Text is rendered as pixels, so keep the aspect ratio when resizing to avoid
  distortion.
