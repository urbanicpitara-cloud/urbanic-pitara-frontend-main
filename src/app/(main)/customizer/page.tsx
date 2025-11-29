"use client";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { Loader2, Upload, ShoppingCart, Type, Palette, RotateCcw, Image as ImageIcon, Sticker, Bold, Italic, Trash2, Ruler } from "lucide-react";
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
}

interface TemplateData {
  [color: string]: {
    [side: string]: string;
  };
}

// Hardcoded fallbacks
const STATIC_HOODIE_COLORS = ["black", "white", "red"] as const;
const STATIC_HOODIE_SIDES = ["front", "back", "left", "right"] as const;
const ART_ASSETS = ["/art/gym/gym1.svg", "/art/quotes/quote1.svg"];
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
const BASE_HOODIE_PRODUCT_ID = "cmiit63lc0000wadchgo1ydck"; // Base product ID for custom orders

// ---------------- Hoodie Image ----------------
const HoodieImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src, "anonymous");
  return <KonvaImage image={image} width={width} height={height} listening={false} />;
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
          const scaleX = node.scaleX();
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

  const [templates, setTemplates] = useState<TemplateData>({});
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [color, setColor] = useState<string>("black");
  const [side, setSide] = useState<HoodieSide>("front");
  const [activeTab, setActiveTab] = useState<"Color" | "Size" | "Side" | "Upload" | "Art" | "Text" | "Order">("Color");

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

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customizer/templates`);
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();

        // If backend returns empty object, we'll rely on static fallbacks
        if (Object.keys(data).length > 0) {
          setTemplates(data);
          setColor(Object.keys(data)[0]);
        }
      } catch (error) {
        console.error(error);
        // Don't show error toast here, just fallback silently
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
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
    setSelectedId(newEl.id);
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
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

      // Upload the design preview to Cloudinary
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "design-preview.png", { type: "image/png" });

      const thumbnailUrl = await uploadToCloudinary(file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customizer/design/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: JSON.stringify(elementsBySide),
          thumbnailUrl,
          color,
          size,
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
  // Priority: Dynamic template -> Static fallback
  let currentTemplateUrl = null;
  if (templates[color] && templates[color][side]) {
    currentTemplateUrl = templates[color][side];
  } else {
    // Fallback logic
    currentTemplateUrl = `/hoodies/${color}/${side}.png`;
  }

  const availableColors = Object.keys(templates).length > 0 ? Object.keys(templates) : STATIC_HOODIE_COLORS;

  if (loadingTemplates) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Customizer</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: "Color", icon: Palette },
            { id: "Size", icon: Ruler },
            { id: "Side", icon: RotateCcw },
            { id: "Upload", icon: Upload },
            { id: "Art", icon: Sticker },
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
                    style={{ backgroundColor: c }}
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
                {STATIC_HOODIE_SIDES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
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
              <div className="grid grid-cols-3 gap-2">
                {ART_ASSETS.map((a) => (
                  <div
                    key={a}
                    className="aspect-square border rounded-lg p-2 cursor-pointer hover:border-black flex items-center justify-center bg-gray-50"
                    onClick={() => addArt(a)}
                  >
                    <img src={a} alt="Art" className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>

              {selectedId && elements.find((el) => el.id === selectedId)?.type === "image" && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Selected Art</p>
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
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-hidden">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <Stage
            width={500}
            height={500}
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
    </div>
  );
}
