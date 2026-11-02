import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer, CircleModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask, RadialGradiantColorMask, VerticalGradiantColorMask, HorizontalGradiantColorMask

TARGET_URL = "https://sangtian-resume.vercel.app"
WS_DIR = r"d:\Antigravity\Canva Resume"

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def make_transparent_base(pil_img):
    """Converts a white-background PIL image to transparent RGBA preserving anti-aliasing."""
    im_rgba = pil_img.convert("RGBA")
    arr = np.array(im_rgba, dtype=np.float32)
    
    # Calculate luminance / closeness to white
    # White is (255, 255, 255)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    
    # In qrcode output, background is pure white (255, 255, 255) and foreground is the colored modules.
    # Alpha should be 0 where color is pure white, and 255 where color is the module.
    # Using Euclidean distance from white (255, 255, 255)
    dist_from_white = np.sqrt((255.0 - r)**2 + (255.0 - g)**2 + (255.0 - b)**2)
    
    # Normalize alpha: threshold around white
    # Anything very close to white is fully transparent
    alpha = np.clip((dist_from_white - 15.0) / 25.0 * 255.0, 0.0, 255.0).astype(np.uint8)
    
    # Set RGB colors clean (remove white contamination on edges)
    arr_out = np.array(im_rgba)
    arr_out[:, :, 3] = alpha
    
    return Image.fromarray(arr_out, mode="RGBA")

def add_neon_glow(base_rgba, glow_color_hex="#00E5B8", radius=18, intensity=0.85):
    """Generates a soft, luminous neon glow bloom behind the transparent QR modules."""
    w, h = base_rgba.size
    glow_rgb = hex_to_rgb(glow_color_hex)
    
    # Create mask from alpha channel
    alpha = base_rgba.split()[3]
    
    # Outer wide ambient aura
    aura_solid = Image.new("RGBA", (w, h), glow_rgb + (int(255 * intensity * 0.45),))
    aura_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    aura_layer.paste(aura_solid, mask=alpha)
    aura_blurred = aura_layer.filter(ImageFilter.GaussianBlur(radius=radius * 1.6))
    
    # Core bright inner glow
    core_solid = Image.new("RGBA", (w, h), glow_rgb + (int(255 * intensity * 0.8),))
    core_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    core_layer.paste(core_solid, mask=alpha)
    core_blurred = core_layer.filter(ImageFilter.GaussianBlur(radius=radius * 0.5))
    
    # Composite: aura -> core -> sharp foreground
    combined = Image.alpha_composite(aura_blurred, core_blurred)
    final = Image.alpha_composite(combined, base_rgba)
    return final

def generate_all_qrs():
    print("Generating High-Resolution Styled QR Codes...")
    
    # Setup base QR parameters
    # box_size=36 gives ~1500x1500px resolution, perfect 300 DPI for high-end print/digital resume
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=36,
        border=4
    )
    qr.add_data(TARGET_URL)
    
    # 1. Main Signature: Neon Glow (Rounded Modules, Glowing #00E5B8, Transparent PNG)
    print("1. Creating qr_code_neon_glow.png...")
    raw_img1 = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=SolidFillColorMask(front_color=(0, 229, 184), back_color=(255, 255, 255))
    )
    trans1 = make_transparent_base(raw_img1)
    glowing1 = add_neon_glow(trans1, glow_color_hex="#00E5B8", radius=10, intensity=0.65)
    path1 = os.path.join(WS_DIR, "qr_code_neon_glow.png")
    glowing1.save(path1, "PNG", dpi=(300, 300))
    
    # 2. Crisp Rounded Neon (No blur, smooth rounded corners, ultra sharp transparent PNG)
    print("2. Creating qr_code_crisp_rounded.png...")
    path2 = os.path.join(WS_DIR, "qr_code_crisp_rounded.png")
    trans1.save(path2, "PNG", dpi=(300, 300))
    
    # 3. Biopharma Gradient Glow (#00E5B8 Neon Cyan to #10B981 Emerald Green, Transparent PNG)
    print("3. Creating qr_code_gradient_glow.png...")
    raw_img3 = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=VerticalGradiantColorMask(
            top_color=(0, 229, 184),      # Cyan neon
            bottom_color=(16, 185, 129),  # Emerald green
            back_color=(255, 255, 255)
        )
    )
    trans3 = make_transparent_base(raw_img3)
    glowing3 = add_neon_glow(trans3, glow_color_hex="#00E5B8", radius=14, intensity=0.8)
    path3 = os.path.join(WS_DIR, "qr_code_gradient_glow.png")
    glowing3.save(path3, "PNG", dpi=(300, 300))
    
    # 4. Circular Dots Glow (Organic biological / data points style, Transparent PNG)
    print("4. Creating qr_code_dots_glow.png...")
    raw_img4 = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=CircleModuleDrawer(),
        color_mask=SolidFillColorMask(front_color=(0, 229, 184), back_color=(255, 255, 255))
    )
    trans4 = make_transparent_base(raw_img4)
    glowing4 = add_neon_glow(trans4, glow_color_hex="#00E5B8", radius=14, intensity=0.85)
    path4 = os.path.join(WS_DIR, "qr_code_dots_glow.png")
    glowing4.save(path4, "PNG", dpi=(300, 300))

    # 5. Optional Bonus: Cosmic Dark Card (Pre-composed on #070A12 with HUD border and label)
    print("5. Creating qr_code_cosmic_card.png...")
    w, h = glowing1.size
    pad = 80
    card_w = w + pad * 2
    card_h = h + pad * 2 + 60
    card = Image.new("RGBA", (card_w, card_h), (7, 10, 18, 255)) # #070A12
    card_draw = ImageDraw.Draw(card)
    # Rounded border
    card_draw.rounded_rectangle(
        [10, 10, card_w - 10, card_h - 10],
        radius=28,
        outline=(0, 229, 184, 90),
        width=2
    )
    # Paste QR in center
    card.paste(glowing1, (pad, pad), mask=glowing1.split()[3])
    path5 = os.path.join(WS_DIR, "qr_code_cosmic_card.png")
    card.save(path5, "PNG", dpi=(300, 300))

    print("\nAll QR code assets successfully generated!")

if __name__ == "__main__":
    generate_all_qrs()
