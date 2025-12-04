"use client";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { Loader2, Upload, ShoppingCart, Type, Palette, RotateCcw, Image as ImageIcon, Sticker, Bold, Italic, Trash2, Ruler, Shirt, Wand2 } from "lucide-react";
import { toast } from "sonner";

// Types
type HoodieSide = "front" | "back" | "left" | "right";
type ElementType = "image" | "text";

export interface CanvasElement {
  id: string;
  type: ElementType;
  src?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // "normal" | "bold" | "italic" | "bold italic"
  fill?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  // Text styling enhancements
  backgroundColor?: string; // Hex color or 'transparent'
  backgroundOpacity?: number; // 0-1
  borderColor?: string; // Hex color
  borderWidth?: number; // 0-5
  letterSpacing?: number; // -2 to 5
  lineHeight?: number; // 0.8 to 2.0
  // SVG customization properties
  svgProperties?: {
    fillColor?: string; // Override SVG fill color
    strokeColor?: string; // Override SVG stroke color
    strokeWidth?: number; // Override stroke width
    opacity?: number; // Overall SVG opacity (0-1)
  };
}

interface TemplateData {
  [color: string]: {
    [side: string]: string;
  };
}

// Hardcoded fallbacks

const STATIC_HOODIE_COLORS = ["black"] as const;
const STATIC_HOODIE_SIDES = ["front", "back"] as const;

// Fallback assets if DB is empty
const STATIC_ART_ASSETS = ["/art/gym/gym1.svg", "/art/quotes/quote1.svg"];
const FONT_FAMILIES = [
  "Arial",
  "Verdana",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Impact",
  "Comic Sans MS",
  "Trebuchet MS",
  "Lucida Console",
  "Palatino",
  "Garamond",
  "Bookman",
  "Tahoma",
  "Segoe UI",
  "Calibri",
  "Consolas",
  "Courier",
  "Helvetica",
  "Helvetica Neue",
  "Aptos",
  "Cambria",
  "Monaco",
] as const;
// const BASE_HOODIE_PRODUCT_ID = "cmiit63lc0000wadchgo1ydck"; // Base product ID for custom orders

// ---------------- Hoodie Image ----------------
const HoodieImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src, "anonymous");

  if (!image) return null;

  // Calculate aspect ratio to fit within bounds while preserving original ratio
  const imgRatio = image.width / image.height;
  const containerRatio = width / height;

  let renderWidth = width;
  let renderHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > containerRatio) {
    // Image is wider than container
    renderHeight = width / imgRatio;
    offsetY = (height - renderHeight) / 2;
  } else {
    // Image is taller than container
    renderWidth = height * imgRatio;
    offsetX = (width - renderWidth) / 2;
  }

  return <KonvaImage image={image} x={offsetX} y={offsetY} width={renderWidth} height={renderHeight} listening={false} />;
};

// Helper: Detect if URL is SVG
const isSvgUrl = (url?: string): boolean => {
  return !!url && url.toLowerCase().endsWith('.svg');
};

// Helper: Apply SVG customizations via CSS filters & transforms
const getSvgFilterStyle = (svgProps?: any): React.CSSProperties => {
  if (!svgProps) return {};

  let filter = '';
  const styles: React.CSSProperties = {};

  // Apply opacity
  if (svgProps.opacity !== undefined) {
    styles.opacity = svgProps.opacity;
  }

  if (filter) {
    styles.filter = filter.trim();
  }

  return styles;
};

// SVG Image Component with customization support
const SVGImage = ({
  svgUrl,
  width,
  height,
  svgProperties,
}: {
  svgUrl: string;
  width: number;
  height: number;
  svgProperties?: any;
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAndCustomizeSVG = async () => {
      try {
        const response = await fetch(svgUrl);
        let content = await response.text();

        // Apply customizations to SVG content
        if (svgProperties) {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(content, 'image/svg+xml');

          if (svgDoc.documentElement.tagName === 'svg') {
            // Apply fill color
            if (svgProperties.fillColor) {
              svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line, g').forEach((el) => {
                const currentFill = el.getAttribute('fill');
                // Apply fill to elements that don't have fill="none"
                if (currentFill !== 'none') {
                  el.setAttribute('fill', svgProperties.fillColor);
                }
              });
            }

            // Apply stroke color - apply to ALL elements
            if (svgProperties.strokeColor) {
              svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line').forEach((el) => {
                el.setAttribute('stroke', svgProperties.strokeColor);
              });
            }

            // Apply stroke width - apply to ALL elements
            if (svgProperties.strokeWidth !== undefined) {
              if (svgProperties.strokeWidth === 0) {
                // Remove stroke when width is 0
                svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line').forEach((el) => {
                  el.removeAttribute('stroke');
                  el.removeAttribute('stroke-width');
                });
              } else {
                // Apply stroke width and ensure visibility
                svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line').forEach((el) => {
                  el.setAttribute('stroke-width', svgProperties.strokeWidth.toString());
                  if (!el.getAttribute('stroke')) {
                    el.setAttribute('stroke', '#000000');
                  }
                });
              }
            }

            // Apply opacity
            if (svgProperties.opacity !== undefined) {
              svgDoc.documentElement.setAttribute('opacity', svgProperties.opacity.toString());
            }

            content = new XMLSerializer().serializeToString(svgDoc.documentElement);
          }
        }

        setSvgContent(content);
      } catch (error) {
        console.error('Failed to load SVG:', error);
      }
    };

    fetchAndCustomizeSVG();
  }, [svgUrl, svgProperties]);

  return (
    <div
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...getSvgFilterStyle(svgProperties),
      }}
    />
  );
};

// Draggable SVG wrapper using HTML2Canvas approach
const DraggableSVGImage = ({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: CanvasElement) => void;
}) => {
  const svgContainerRef = useRef<any>(null);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [svgImage, setSvgImage] = useState<any>(null);

  useEffect(() => {
    // Convert SVG to canvas image for Konva compatibility
    const loadSVGAsImage = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Create a wrapper canvas to render SVG
        const canvas = document.createElement('canvas');
        canvas.width = element.width;
        canvas.height = element.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Fetch SVG and render to canvas
          const response = await fetch(element.src!);
          let svgText = await response.text();

          // Apply customizations to SVG before rendering
          if (element.svgProperties) {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

            if (svgDoc.documentElement.tagName === 'svg') {
              // Apply fill color
              if (element.svgProperties.fillColor) {
                svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line, g').forEach((el) => {
                  const currentFill = el.getAttribute('fill');
                  // Apply fill to elements that don't have fill="none"
                  if (currentFill !== 'none') {
                    el.setAttribute('fill', element.svgProperties!.fillColor!);
                  }
                });
              }

              // Apply stroke color - apply to ALL elements
              if (element.svgProperties.strokeColor) {
                svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line').forEach((el) => {
                  el.setAttribute('stroke', element.svgProperties!.strokeColor!);
                });
              }

              // Apply stroke width - apply to ALL elements
              if (element.svgProperties.strokeWidth !== undefined) {
                if (element.svgProperties.strokeWidth === 0) {
                  // Remove stroke when width is 0
                  svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line').forEach((el) => {
                    el.removeAttribute('stroke');
                    el.removeAttribute('stroke-width');
                  });
                } else {
                  // Apply stroke width and ensure visibility
                  svgDoc.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line').forEach((el) => {
                    el.setAttribute('stroke-width', element.svgProperties!.strokeWidth!.toString());
                    if (!el.getAttribute('stroke')) {
                      el.setAttribute('stroke', '#000000');
                    }
                  });
                }
              }

              // Apply opacity
              if (element.svgProperties.opacity !== undefined) {
                svgDoc.documentElement.setAttribute('opacity', element.svgProperties.opacity.toString());
              }

              svgText = new XMLSerializer().serializeToString(svgDoc.documentElement);
            }
          }

          const blob = new Blob([svgText], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const canvasImg = new window.Image();
            canvasImg.src = canvas.toDataURL();
            canvasImg.onload = () => {
              setSvgImage(canvasImg);
            };
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      } catch (error) {
        console.error('Failed to render SVG as image:', error);
      }
    };

    loadSVGAsImage();
  }, [element.src, element.width, element.height, element.svgProperties]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {svgImage && (
        <KonvaImage
          ref={shapeRef}
          image={svgImage}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation || 0}
          draggable
          opacity={element.svgProperties?.opacity ?? 1}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
          onTransformEnd={() => {
            const node = shapeRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...element,
              x: node.x(),
              y: node.y(),
              width: Math.max(10, node.width() * scaleX),
              height: Math.max(10, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// ---------------- Draggable Image ----------------
const URLImage = ({
  image,
  isSelected,
  onSelect,
  onChange,
}: {
  image: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: CanvasElement) => void;
}) => {
  // Check if this is an SVG image
  const isSvg = isSvgUrl(image.src);

  if (isSvg) {
    // Use SVG-aware component for SVG images
    return <DraggableSVGImage element={image} isSelected={isSelected} onSelect={onSelect} onChange={onChange} />;
  }

  // Regular image handling
  const [img] = useImage(image.src || "", "anonymous");
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        rotation={image.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...image, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...image,
            x: node.x(),
            y: node.y(),
            width: Math.max(10, node.width() * scaleX),
            height: Math.max(10, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// ---------------- Draggable Text ----------------
const URLText = ({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: CanvasElement) => void;
}) => {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const bgRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {/* Background Rectangle for text */}
      {element.backgroundColor && element.backgroundColor !== 'transparent' && (
        <Rect
          ref={bgRef}
          x={element.x}
          y={element.y}
          width={element.width || 100}
          height={element.height || 50}
          fill={element.backgroundColor}
          opacity={element.backgroundOpacity ?? 1}
          cornerRadius={4}
        />
      )}
      <Text
        ref={textRef}
        text={element.text}
        x={element.x}
        y={element.y}
        fontSize={element.fontSize || 20}
        fontFamily={element.fontFamily || "Arial"}
        fontStyle={element.fontStyle || "normal"}
        fill={element.fill || "#000"}
        lineHeight={element.lineHeight || 1}
        letterSpacing={element.letterSpacing || 0}
        rotation={element.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = textRef.current;
          if (!node) return;
          // const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: (element.fontSize || 20) * scaleY,
            width: node.width(),
            height: node.height(),
          });
        }}
        padding={element.borderWidth ? 8 : 4}
        stroke={element.borderColor && element.borderWidth ? element.borderColor : undefined}
        strokeWidth={element.borderWidth || 0}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// ---------------- Main Customizer Page ----------------
export default function CustomizerPage() {
  const router = useRouter();
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRefs = useRef<{ [key: string]: any }>({});

  const [templates, setTemplates] = useState<TemplateData>({});
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // ... (state definitions)

  // Helper to get template URL
  const getTemplateUrl = (c: string, s: string) => {
    if (selectedProduct) {
      const variant = selectedProduct.variants.find((v: any) => v.colorName === c);
      if (variant) {
        const view = variant.views.find((v: any) => v.side === s);
        if (view) return view.imageUrl;
      }
    }
    if (templates[c] && templates[c][s]) {
      return templates[c][s];
    }
    return `/hoodies/${c}/${s}.png`;
  };

  // Dynamic Config State
  const [products, setProducts] = useState<any[]>([]);
  const [artCategories, setArtCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedArtCategory, setSelectedArtCategory] = useState<string | null>(null);

  const [color, setColor] = useState<string>("black");
  const [side, setSide] = useState<HoodieSide>("front");
  const [activeTab, setActiveTab] = useState<"Product" | "Color" | "Size" | "Side" | "Upload" | "Art" | "SVG" | "Text" | "Order">("Product");

  const [elementsBySide, setElementsBySide] = useState<Record<HoodieSide, CanvasElement[]>>({
    front: [],
    back: [],
    left: [],
    right: [],
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [customImageUploading, setCustomImageUploading] = useState(false);
  const [size, setSize] = useState<string>("M");
  const [calculatedPrice, setCalculatedPrice] = useState<number>(899);
  const [scale, setScale] = useState(1);

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = window.innerWidth;
      // On mobile/tablet, we want the canvas to fit the screen width minus padding
      // 500 is the base canvas size
      // We subtract 48px for padding (32px container padding + some safety margin)
      const newScale = Math.min(1, (containerWidth - 48) / 500);
      setScale(newScale);
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate price whenever elements or size changes
  useEffect(() => {
    let price = 0;

    // Base Price
    if (["L", "XL", "2XL"].includes(size)) {
      price += 999;
    } else {
      price += 899;
    }

    // Design Cost
    const CANVAS_AREA = 500 * 500;
    const allElements = [
      ...elementsBySide.front,
      ...elementsBySide.back,
      ...elementsBySide.left,
      ...elementsBySide.right
    ];

    allElements.forEach(el => {
      if (el.type === 'text') {
        price += 50;
      } else if (el.type === 'image') {
        const area = el.width * el.height;
        const coverage = area / CANVAS_AREA;

        // Revised Pricing Logic
        if (coverage > 0.5) {
          price += 300; // Large
        } else if (coverage > 0.2) {
          price += 200; // Medium
        } else {
          price += 100; // Small (Base cost for adding any image)
        }
      }
    });

    setCalculatedPrice(price);
  }, [size, elementsBySide]);

  // Fetch configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        let hasProducts = false;

        // 1. Fetch Dynamic Config (Products & Arts)
        const configRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customizer/config`);
        if (configRes.ok) {
          const config = await configRes.json();
          setProducts(config.products || []);
          setArtCategories(config.artCategories || []);

          if (config.products && config.products.length > 0) {
            hasProducts = true;
            // Select first product by default
            const firstProd = config.products[0];
            setSelectedProduct(firstProd);

            // Select first variant color
            if (firstProd.variants && firstProd.variants.length > 0) {
              setColor(firstProd.variants[0].colorName); // Use color name as key
            }
          }
        }

        // 2. Fetch Legacy Templates (Fallback)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customizer/templates`);
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();

        // If backend returns empty object, we'll rely on static fallbacks
        if (Object.keys(data).length > 0) {
          setTemplates(data);
          // Only set color from legacy templates if no dynamic product was found
          if (!hasProducts) {
            setColor(Object.keys(data)[0]);
          }
        }
      } catch (error) {
        console.error(error);
        // Don't show error toast here, just fallback silently
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchConfig();
  }, []);

  // Handle Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true";

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !isInputFocused) {
        deleteElement(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, side, elementsBySide]);

  const elements = elementsBySide[side];

  const checkDeselect = (e: any) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: "image",
        src: url,
        x: 150,
        y: 150,
        width: 150,
        height: 150,
      };
      setElementsBySide({ ...elementsBySide, [side]: [...elements, newEl] });
      setSelectedId(newEl.id);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setCustomImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addArt = (src: string) => {
    const newEl: CanvasElement = {
      id: Date.now().toString(),
      type: "image",
      src,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
    };
    setElementsBySide({ ...elementsBySide, [side]: [...elements, newEl] });
    // Delay selection slightly to ensure SVG is fully rendered (especially for DraggableSVGImage)
    setTimeout(() => {
      setSelectedId(newEl.id);
    }, 100);
  };

  const addText = () => {
    const newText: CanvasElement = {
      id: Date.now().toString(),
      type: "text",
      text: "Your Text",
      fontSize: 24,
      fontFamily: "Arial",
      fontStyle: "normal",
      fill: "#000000",
      x: 150,
      y: 150,
      width: 100,
      height: 50,
    };
    setElementsBySide({ ...elementsBySide, [side]: [...elements, newText] });
    setSelectedId(newText.id);
  };

  const deleteElement = (id: string) => {
    setElementsBySide({
      ...elementsBySide,
      [side]: elements.filter((el) => el.id !== id),
    });
    if (selectedId === id) setSelectedId(null);
  };

  const changeElementColor = (newColor: string) => {
    if (!selectedId) return;
    const updated = elements.map((el) =>
      el.id === selectedId ? { ...el, fill: newColor } : el
    );
    setElementsBySide({ ...elementsBySide, [side]: updated });
  };

  const toggleFontStyle = (style: "bold" | "italic") => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el || !el.fontStyle) return;

    let current = el.fontStyle;
    let next = current;

    if (style === "bold") {
      if (current.includes("bold")) next = current.replace("bold", "").trim();
      else next = `${current} bold`.trim();
    } else {
      if (current.includes("italic")) next = current.replace("italic", "").trim();
      else next = `${current} italic`.trim();
    }

    // Normalize empty to normal
    if (!next) next = "normal";

    const updated = elements.map((e) =>
      e.id === selectedId ? { ...e, fontStyle: next } : e
    );
    setElementsBySide({ ...elementsBySide, [side]: updated });
  };

  const handleAddToCart = async () => {
    if (!stageRef.current) return;
    setUploading(true);
    setSelectedId(null); // Deselect to remove transformers from screenshot

    // Wait a tick for transformer to disappear
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const snapshots: Record<string, string> = {};

      // Capture all sides from hidden stages
      for (const [s, stage] of Object.entries(previewRefs.current)) {
        if (!stage) continue;
        const dataUrl = stage.toDataURL({ pixelRatio: 2 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `preview-${s}.png`, { type: "image/png" });
        const url = await uploadToCloudinary(file);
        snapshots[s] = url;
      }

      // Use current side as main thumbnail, or fallback to first available
      const thumbnailUrl = snapshots[side] || Object.values(snapshots)[0];

      if (!thumbnailUrl) throw new Error("Failed to generate preview");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customizer/design/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: JSON.stringify(elementsBySide),
          thumbnailUrl,
          snapshots,
          color,
          size,
          title: selectedProduct?.name ? `${selectedProduct.name} - Custom` : "Custom Hoodie",
        }),
      });

      if (!response.ok) throw new Error("Failed to save design");

      const { customProductId } = await response.json();

      // Add custom product to cart - NO base product needed!
      const cartRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // CRITICAL: Send cookies with request
        body: JSON.stringify({
          customProductId,
          quantity
        }),
      });

      if (!cartRes.ok) {
        const errData = await cartRes.json();
        throw new Error(errData.error || "Failed to add to cart");
      }

      toast.success("Added to cart!");
      router.push("/cart");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong adding to cart");
    } finally {
      setUploading(false);
    }
  };

  // Determine which template URL to use
  // Priority: Dynamic Product -> Legacy Dynamic Template -> Static Fallback
  let currentTemplateUrl = null;
  let availableColors: string[] = [];

  if (selectedProduct) {
    // 1. Dynamic Product Logic
    const variant = selectedProduct.variants.find((v: any) => v.colorName === color);
    if (variant) {
      const view = variant.views.find((v: any) => v.side === side);
      if (view) currentTemplateUrl = view.imageUrl;
    }
    // Populate available colors from dynamic product
    availableColors = selectedProduct.variants.map((v: any) => v.colorName);
  }

  if (!currentTemplateUrl) {
    // 2. Legacy/Fallback Logic
    if (templates[color] && templates[color][side]) {
      currentTemplateUrl = templates[color][side];
      availableColors = Object.keys(templates);
    } else {
      // 3. Static Fallback
      currentTemplateUrl = `/hoodies/${color}/${side}.png`;
      availableColors = STATIC_HOODIE_COLORS as any;
    }
  }

  // Determine available arts
  // If we have categories from DB, use them. Otherwise fallback.
  // For simplicity in this UI version, we'll flatten all assets if categories exist, 
  // or use static assets.
  let displayArts = STATIC_ART_ASSETS;
  if (artCategories.length > 0) {
    displayArts = artCategories.flatMap(c => c.assets.map((a: any) => a.url));
  }

  // Determine available sides
  let availableSides: string[] = [];
  if (selectedProduct) {
    const variant = selectedProduct.variants.find((v: any) => v.colorName === color);
    if (variant) {
      availableSides = variant.views.map((v: any) => v.side);
    }
  } else if (templates[color]) {
    availableSides = Object.keys(templates[color]);
  } else {
    availableSides = STATIC_HOODIE_SIDES as any;
  }

  if (loadingTemplates) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Customizer</h1>
        </div>

        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: "Product", icon: Shirt },
            { id: "Color", icon: Palette },
            { id: "Size", icon: Ruler },
            { id: "Side", icon: RotateCcw },
            { id: "Upload", icon: Upload },
            { id: "Art", icon: Sticker },
            { id: "SVG", icon: Wand2 },
            { id: "Text", icon: Type },
            { id: "Order", icon: ShoppingCart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 p-3 flex justify-center items-center border-b-2 transition-colors ${activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
            >
              <tab.icon size={20} />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === "Product" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Select Product</h3>
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      if (p.variants.length > 0) {
                        setColor(p.variants[0].colorName);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${selectedProduct?.id === p.id
                      ? "bg-black text-white border-black ring-2 ring-black ring-offset-2"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs opacity-80 mt-1">₹{p.basePrice}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Color" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Select Color</h3>
              <div className="grid grid-cols-4 gap-3">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${color === c ? "border-black scale-110" : "border-gray-400"
                      }`}
                    style={{ backgroundColor: selectedProduct ? selectedProduct.variants.find((v: any) => v.colorName === c)?.colorHex : c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "Size" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Select Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {["S", "M", "L", "XL", "2XL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-12 rounded-lg border font-medium transition-all ${size === s
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p>Base Price:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>S, M: ₹899</li>
                  <li>L, XL, 2XL: ₹999</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "Side" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Select View</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableSides.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s as HoodieSide)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${side === s
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Upload" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Upload Image</h3>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {customImageUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={customImageUploading}
                />
              </div>

              {selectedId && elements.find((el) => el.id === selectedId)?.type === "image" && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Selected Image</p>
                  <button
                    onClick={() => deleteElement(selectedId!)}
                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove Image
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "Art" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Stickers & Art</h3>

              {/* Category Selection */}
              {artCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedArtCategory(null)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedArtCategory === null
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      All
                    </button>
                    {artCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedArtCategory(cat.id)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedArtCategory === cat.id
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Assets Grid */}
              <div className="grid grid-cols-3 gap-2">
                {artCategories.length > 0 ? (
                  // Show assets from selected category or all categories
                  (selectedArtCategory === null
                    ? artCategories.flatMap((cat) => cat.assets)
                    : artCategories.find((cat) => cat.id === selectedArtCategory)?.assets || []
                  ).map((asset: any) => (
                    <div
                      key={asset.id}
                      className="aspect-square border rounded-lg p-2 cursor-pointer hover:border-black flex items-center justify-center bg-gray-50"
                      onClick={() => addArt(asset.url)}
                    >
                      <img src={asset.url} alt={asset.name || "Art"} className="w-full h-full object-contain" />
                    </div>
                  ))
                ) : (
                  // Fallback to displayArts if no categories
                  displayArts.map((a) => (
                    <div
                      key={a}
                      className="aspect-square border rounded-lg p-2 cursor-pointer hover:border-black flex items-center justify-center bg-gray-50"
                      onClick={() => addArt(a)}
                    >
                      <img src={a} alt="Art" className="w-full h-full object-contain" />
                    </div>
                  ))
                )}
              </div>

              {selectedId && elements.find((el) => el.id === selectedId)?.type === "image" && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Selected Art</p>
                  {isSvgUrl(elements.find((el) => el.id === selectedId)?.src) && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">SVG Customization Available ✨</p>
                    </div>
                  )}
                  <button
                    onClick={() => deleteElement(selectedId!)}
                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove Art
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SVG Customization Tab */}
          {activeTab === "SVG" && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">SVG Customization</h3>
              <p className="text-xs text-gray-600">Select an SVG art to customize</p>

              {selectedId && elements.find((el) => el.id === selectedId)?.type === "image" && isSvgUrl(elements.find((el) => el.id === selectedId)?.src) ? (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {/* Fill Color */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Fill Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={elements.find((el) => el.id === selectedId)?.svgProperties?.fillColor || "#000000"}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId
                              ? {
                                ...el,
                                svgProperties: {
                                  ...el.svgProperties,
                                  fillColor: e.target.value,
                                },
                              }
                              : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 flex-1">
                        {elements.find((el) => el.id === selectedId)?.svgProperties?.fillColor || "#000000"}
                      </span>
                      <button
                        onClick={() => {
                          const updated = elements.map((el) =>
                            el.id === selectedId
                              ? {
                                ...el,
                                svgProperties: {
                                  ...el.svgProperties,
                                  fillColor: undefined,
                                },
                              }
                              : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Stroke Color */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Stroke Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={elements.find((el) => el.id === selectedId)?.svgProperties?.strokeColor || "#000000"}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId
                              ? {
                                ...el,
                                svgProperties: {
                                  ...el.svgProperties,
                                  strokeColor: e.target.value,
                                },
                              }
                              : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 flex-1">
                        {elements.find((el) => el.id === selectedId)?.svgProperties?.strokeColor || "#000000"}
                      </span>
                      <button
                        onClick={() => {
                          const updated = elements.map((el) =>
                            el.id === selectedId
                              ? {
                                ...el,
                                svgProperties: {
                                  ...el.svgProperties,
                                  strokeColor: undefined,
                                },
                              }
                              : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Stroke Width */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Stroke Width: {elements.find((el) => el.id === selectedId)?.svgProperties?.strokeWidth ?? 0}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={elements.find((el) => el.id === selectedId)?.svgProperties?.strokeWidth ?? 0}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId
                            ? {
                              ...el,
                              svgProperties: {
                                ...el.svgProperties,
                                strokeWidth: parseFloat(e.target.value),
                              },
                            }
                            : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Opacity: {Math.round((elements.find((el) => el.id === selectedId)?.svgProperties?.opacity ?? 1) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={elements.find((el) => el.id === selectedId)?.svgProperties?.opacity ?? 1}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId
                            ? {
                              ...el,
                              svgProperties: {
                                ...el.svgProperties,
                                opacity: parseFloat(e.target.value),
                              },
                            }
                            : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Reset All */}
                  <button
                    onClick={() => {
                      const updated = elements.map((el) =>
                        el.id === selectedId
                          ? {
                            ...el,
                            svgProperties: {
                              fillColor: undefined,
                              strokeColor: undefined,
                              strokeWidth: 0,
                              opacity: 1,
                            },
                          }
                          : el
                      );
                      setElementsBySide({ ...elementsBySide, [side]: updated });
                    }}
                    className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                  >
                    Reset All
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                  <p>👈 Select an SVG art from the Art tab to customize it</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Text" && (
            <div className="space-y-4">
              <button
                onClick={addText}
                className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Type size={16} />
                Add Text
              </button>

              {selectedId && elements.find((el) => el.id === selectedId)?.type === "text" && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Text Content</label>
                    <input
                      type="text"
                      value={elements.find((el) => el.id === selectedId)?.text}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId ? { ...el, text: e.target.value } : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Family</label>
                    <select
                      value={elements.find((el) => el.id === selectedId)?.fontFamily || "Arial"}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId ? { ...el, fontFamily: e.target.value } : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Size</label>
                    <input
                      type="range"
                      min="12"
                      max="100"
                      value={elements.find((el) => el.id === selectedId)?.fontSize || 24}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId ? { ...el, fontSize: parseInt(e.target.value) } : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Style</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFontStyle("bold")}
                        className={`p-2 border rounded ${elements.find(e => e.id === selectedId)?.fontStyle?.includes("bold") ? "bg-black text-white" : "bg-white text-black"}`}
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => toggleFontStyle("italic")}
                        className={`p-2 border rounded ${elements.find(e => e.id === selectedId)?.fontStyle?.includes("italic") ? "bg-black text-white" : "bg-white text-black"}`}
                      >
                        <Italic size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={elements.find((el) => el.id === selectedId)?.fill || "#000000"}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId ? { ...el, fill: e.target.value } : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{elements.find((el) => el.id === selectedId)?.fill || "#000000"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={elements.find((el) => el.id === selectedId)?.backgroundColor || "#FFFFFF"}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId ? { ...el, backgroundColor: e.target.value } : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <select
                        value={elements.find((el) => el.id === selectedId)?.backgroundColor === 'transparent' ? 'transparent' : 'solid'}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId ? { ...el, backgroundColor: e.target.value === 'transparent' ? 'transparent' : '#FFFFFF' } : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      >
                        <option value="solid">Solid</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Background Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={elements.find((el) => el.id === selectedId)?.backgroundOpacity ?? 1}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId ? { ...el, backgroundOpacity: parseFloat(e.target.value) } : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Border Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={elements.find((el) => el.id === selectedId)?.borderColor || "#000000"}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId ? { ...el, borderColor: e.target.value } : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">Border Width:</span>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={elements.find((el) => el.id === selectedId)?.borderWidth || 0}
                        onChange={(e) => {
                          const updated = elements.map((el) =>
                            el.id === selectedId ? { ...el, borderWidth: parseInt(e.target.value) } : el
                          );
                          setElementsBySide({ ...elementsBySide, [side]: updated });
                        }}
                        className="w-16"
                      />
                      <span className="text-sm">{elements.find((el) => el.id === selectedId)?.borderWidth || 0}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Line Height</label>
                    <input
                      type="range"
                      min="0.8"
                      max="2"
                      step="0.1"
                      value={elements.find((el) => el.id === selectedId)?.lineHeight ?? 1}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId ? { ...el, lineHeight: parseFloat(e.target.value) } : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{elements.find((el) => el.id === selectedId)?.lineHeight ?? 1}x</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Letter Spacing</label>
                    <input
                      type="range"
                      min="-2"
                      max="5"
                      step="0.5"
                      value={elements.find((el) => el.id === selectedId)?.letterSpacing ?? 0}
                      onChange={(e) => {
                        const updated = elements.map((el) =>
                          el.id === selectedId ? { ...el, letterSpacing: parseFloat(e.target.value) } : el
                        );
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{elements.find((el) => el.id === selectedId)?.letterSpacing ?? 0}px</span>
                  </div>
                  <button
                    onClick={() => deleteElement(selectedId!)}
                    className="text-red-500 text-sm hover:underline w-full text-left flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove Text
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "Order" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Unit Price</span>
                  <span className="font-medium">₹{calculatedPrice}</span>
                </div>
                <div className="flex justify-between mb-4 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(calculatedPrice * quantity).toFixed(2)}</span>
                </div>

                <button
                  disabled={uploading}
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className="w-full md:flex-1 bg-gray-50 flex items-center justify-center p-4 md:p-8 overflow-hidden min-h-[300px] md:min-h-0"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="bg-transparent overflow-hidden">
          <Stage
            width={600 * scale}
            height={600 * scale}
            scale={{ x: scale, y: scale }}
            ref={stageRef}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              {currentTemplateUrl ? (
                <HoodieImage src={currentTemplateUrl} width={500} height={500} />
              ) : (
                <Text text="No template available" x={150} y={240} fontSize={20} />
              )}

              {elements.map((el, i) => {
                if (el.type === "image") {
                  return (
                    <URLImage
                      key={el.id}
                      image={el}
                      isSelected={el.id === selectedId}
                      onSelect={() => setSelectedId(el.id)}
                      onChange={(newAttrs) => {
                        const updated = [...elements];
                        updated[i] = newAttrs;
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                    />
                  );
                } else if (el.type === "text") {
                  return (
                    <URLText
                      key={el.id}
                      element={el}
                      isSelected={el.id === selectedId}
                      onSelect={() => setSelectedId(el.id)}
                      onChange={(newAttrs) => {
                        const updated = [...elements];
                        updated[i] = newAttrs;
                        setElementsBySide({ ...elementsBySide, [side]: updated });
                      }}
                    />
                  );
                }
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Hidden Stages for Snapshot Capture */}
      <div style={{ position: "absolute", top: -10000, left: -10000, visibility: "hidden" }}>
        {Object.entries(elementsBySide).map(([s, els]) => {
          if (els.length === 0) return null;
          return (
            <Stage
              key={s}
              ref={(node) => {
                if (node) previewRefs.current[s] = node;
                else delete previewRefs.current[s];
              }}
              width={500}
              height={500}
              scale={{ x: 1, y: 1 }}
            >
              <Layer>
                <HoodieImage src={getTemplateUrl(color, s)} width={500} height={500} />
                {els.map((el) => {
                  if (el.type === "image") {
                    return <URLImage key={el.id} image={el} isSelected={false} onSelect={() => { }} onChange={() => { }} />;
                  } else {
                    return <URLText key={el.id} element={el} isSelected={false} onSelect={() => { }} onChange={() => { }} />;
                  }
                })}
              </Layer>
            </Stage>
          );
        })}
      </div>
    </div>
  );
}
