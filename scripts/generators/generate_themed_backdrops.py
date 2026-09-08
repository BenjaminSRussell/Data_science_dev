import os
from PIL import Image, ImageDraw

class ThemedBackdropGenerator:
    def __init__(self, output_dir="output", theme="low_poly"):
        self.output_dir = output_dir
        self.theme = theme
        self.color_palettes = {
            "low_poly": {
                "#300727": "#171717",
                "#6A285E": "#424242",
                "#9C5991": "#797979",
                "#9C59919C": "#7979799C",
                "#CCA0C5": "#C0C0C0",
                "#FAF8F9": "#FFFFFF",
                "#FFFFFF": "#FFFFFF"
            },
            "pixel_art": {
                "#300727": "#000000",
                "#6A285E": "#555555",
                "#9C5991": "#AAAAAA",
                "#9C59919C": "#AAAAAA9C",
                "#CCA0C5": "#FFFFFF",
                "#FAF8F9": "#FFFFFF",
                "#FFFFFF": "#FFFFFF"
            },
            "cartoon": {
                "#300727": "#FF0000",
                "#6A285E": "#00FF00",
                "#9C5991": "#0000FF",
                "#9C59919C": "#0000FF9C",
                "#CCA0C5": "#FFFF00",
                "#FAF8F9": "#FFFFFF",
                "#FFFFFF": "#FFFFFF"
            }
        }
        
        if self.theme not in self.color_palettes:
            raise ValueError(f"Unsupported theme: {self.theme}. Supported themes are: {', '.join(self.color_palettes.keys())}")
        
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_low_poly_backdrop(self, size=(1920, 1080), filename="backdrop.png"):
        locations = {
            "#300727": (0, 0, size[0], size[1] // 3),
            "#6A285E": (0, size[1] // 3, size[0], size[1] // 3 * 2),
            "#9C5991": (0, size[1] // 3 * 2, size[0], size[1]),
            "#9C59919C": (0, 0, size[0] // 3, size[1]),
            "#CCA0C5": (size[0] // 3, 0, size[0] // 3 * 2, size[1]),
            "#FAF8F9": (size[0] // 3 * 2, 0, size[0], size[1]),
            "#FFFFFF": (size[0] // 2, size[1] // 2, size[0] // 2 + 100, size[1] // 2 + 100)
        }

        image = Image.new("RGB", size, "#FFFFFF")
        draw = ImageDraw.Draw(image)

        for location, color in locations.items():
            draw.rectangle(color, fill=self.color_palettes[self.theme].get(location, "#FFFFFF"))

        image.save(os.path.join(self.output_dir, filename))

    def generate_backdrop(self, size=(1920, 1080), filename="backdrop.png"):
        if self.theme == "low_poly":
            self.generate_low_poly_backdrop(size, filename)
        elif self.theme == "pixel_art":
            self.generate_pixel_art_backdrop(size, filename)
        elif self.theme == "cartoon":
            self.generate_cartoon_backdrop(size, filename)
        else:
            raise ValueError(f"Unsupported theme: {self.theme}. Supported themes are: {', '.join(self.color_palettes.keys())}")

    def generate_pixel_art_backdrop(self, size=(1920, 1080), filename="backdrop.png"):
        # Placeholder for pixel art generation logic
        pass

    def generate_cartoon_backdrop(self, size=(1920, 1080), filename="backdrop.png"):
        # Placeholder for cartoon generation logic
        pass