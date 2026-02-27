import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import Image from "next/image";
import { TableWithCTA } from "@/app/components/Table";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useFormData } from "./FormDataContext";

// PRODUCT DATABASE (you can import this from a separate file if preferred)
const PRODUCT_DATABASE = [
  {
    name: "ARTIFICIAL JEWELLERY",
    hsnCode: "71171100",
    keywords: ["artificial jewellery", "fake jewellery", "fashion jewellery"],
  },
  {
    name: "AUTO PARTS",
    hsnCode: "87080000",
    keywords: ["auto parts", "car parts", "vehicle parts"],
  },
  {
    name: "BAG",
    hsnCode: "63053300",
    keywords: ["bag", "carry bag", "hand bag", "shopping bag"],
  },
  {
    name: "BANGLE",
    hsnCode: "70181010",
    keywords: ["bangle", "bangles", "glass bangle", "chooda"],
  },
  {
    name: "BELT",
    hsnCode: "42033000",
    keywords: ["belt", "leather belt", "waist belt"],
  },
  {
    name: "BINDI",
    hsnCode: "33049940",
    keywords: ["bindi", "bindis", "forehead decoration"],
  },
  {
    name: "BLANKET",
    hsnCode: "63014000",
    keywords: ["blanket", "woolen blanket", "cotton blanket"],
  },
  {
    name: "BOOKS",
    hsnCode: "49011010",
    keywords: ["books", "book", "notebook", "copy"],
  },
  {
    name: "BRUSH",
    hsnCode: "85030090",
    keywords: ["brush", "hair brush", "paint brush"],
  },
  {
    name: "CANDY",
    hsnCode: "17040000",
    keywords: ["candy", "candies", "sweet", "toffee"],
  },
  {
    name: "CAP",
    hsnCode: "65050090",
    keywords: ["cap", "hat", "baseball cap"],
  },
  {
    name: "CLIP",
    hsnCode: "83059020",
    keywords: ["clip", "paper clip", "hair clip"],
  },
  { name: "COMB", hsnCode: "96151900", keywords: ["comb", "hair comb"] },
  {
    name: "COSMETIC",
    hsnCode: "33030000",
    keywords: ["cosmetic", "makeup", "beauty product"],
  },
  {
    name: "COTTON BABY DRESS",
    hsnCode: "61112000",
    keywords: ["cotton baby dress", "baby dress", "infant dress"],
  },
  {
    name: "COTTON BEDSHEET",
    hsnCode: "63023100",
    keywords: ["cotton bedsheet", "bedsheet", "bed sheet"],
  },
  {
    name: "COTTON CLOTH",
    hsnCode: "61142000",
    keywords: ["cotton cloth", "fabric", "textile"],
  },
  {
    name: "COTTON CURTAIN",
    hsnCode: "63039100",
    keywords: ["cotton curtain", "curtain", "window curtain"],
  },
  {
    name: "COTTON DUPATTA",
    hsnCode: "62171090",
    keywords: ["cotton dupatta", "dupatta", "scarf"],
  },
  {
    name: "COTTON HANKY",
    hsnCode: "62132000",
    keywords: ["cotton hanky", "handkerchief", "hanky"],
  },
  {
    name: "COTTON KURTA PAJAMA",
    hsnCode: "62031910",
    keywords: ["cotton kurta pajama", "kurta pajama", "kurta pyjama"],
  },
  {
    name: "COTTON LADIES SUIT",
    hsnCode: "62041290",
    keywords: ["cotton ladies suit", "ladies suit", "salwar suit"],
  },
  {
    name: "COTTON LOWER",
    hsnCode: "62046290",
    keywords: ["cotton lower", "lower", "pajama", "pyjama"],
  },
  {
    name: "COTTON NIGHT DRESS",
    hsnCode: "62082190",
    keywords: ["cotton night dress", "night dress", "nightgown"],
  },
  {
    name: "COTTON PANT",
    hsnCode: "62034290",
    keywords: ["cotton pant", "pant", "trousers", "pants"],
  },
  {
    name: "COTTON PILLOW COVER",
    hsnCode: "63049231",
    keywords: ["cotton pillow cover", "pillow cover", "pillow case"],
  },
  {
    name: "COTTON SHIRT",
    hsnCode: "62052090",
    keywords: ["cotton shirt", "shirt", "formal shirt"],
  },
  {
    name: "COTTON SHORTS",
    hsnCode: "62046290",
    keywords: ["cotton shorts", "shorts", "bermuda"],
  },
  {
    name: "COTTON T SHIRT",
    hsnCode: "61091000",
    keywords: ["cotton t shirt", "t-shirt", "tshirt", "tee"],
  },
  {
    name: "COTTON THREAD",
    hsnCode: "52041190",
    keywords: ["cotton thread", "thread", "sewing thread"],
  },
  {
    name: "COTTON TIE",
    hsnCode: "62159010",
    keywords: ["cotton tie", "tie", "necktie"],
  },
  {
    name: "COTTON TOP",
    hsnCode: "62063090",
    keywords: ["cotton top", "top", "blouse"],
  },
  {
    name: "COTTON TOWEL",
    hsnCode: "63049260",
    keywords: ["cotton towel", "towel", "bath towel"],
  },
  {
    name: "COTTON UNDERGARMENTS",
    hsnCode: "61071100",
    keywords: ["cotton undergarments", "undergarments", "innerwear"],
  },
  {
    name: "DENIM JEANS",
    hsnCode: "62034290",
    keywords: ["denim jeans", "jeans", "dungaree"],
  },
  {
    name: "DRY FRUITS",
    hsnCode: "8135020",
    keywords: ["dry fruits", "dry fruit", "nuts", "almonds"],
  },
  {
    name: "EMPTY BOX",
    hsnCode: "48191090",
    keywords: ["empty box", "box", "cardboard box"],
  },
  {
    name: "ENVELOPE",
    hsnCode: "48171000",
    keywords: ["envelope", "letter envelope"],
  },
  {
    name: "GIFT CARD",
    hsnCode: "49090010",
    keywords: ["gift card", "greeting card"],
  },
  {
    name: "GLOVES",
    hsnCode: "61169990",
    keywords: ["gloves", "glove", "hand gloves"],
  },
  {
    name: "GOGGLES",
    hsnCode: "90041000",
    keywords: ["goggles", "sunglasses", "eye protection"],
  },
  {
    name: "HAIR BAND",
    hsnCode: "40169920",
    keywords: ["hair band", "hairband", "headband"],
  },
  {
    name: "HOME DECORATIVE",
    hsnCode: "68159990",
    keywords: ["home decorative", "decoration", "home decor"],
  },
  {
    name: "HOMEMADE SWEET",
    hsnCode: "17049090",
    keywords: ["homemade sweet", "mithai", "sweets"],
  },
  {
    name: "HOUSEHOLD ITEMS",
    hsnCode: "39240000",
    keywords: ["household items", "houseware", "home items"],
  },
  {
    name: "LADIES PURSE",
    hsnCode: "42022110",
    keywords: ["ladies purse", "purse", "handbag"],
  },
  {
    name: "LEHENGA",
    hsnCode: "62041390",
    keywords: ["lehenga", "lehenga choli"],
  },
  {
    name: "MOBILE ACCESSORIES",
    hsnCode: "85170000",
    keywords: ["mobile accessories", "phone accessories"],
  },
  {
    name: "MOSQUITO NET",
    hsnCode: "63049270",
    keywords: ["mosquito net", "mosquito netting"],
  },
  {
    name: "OPTICAL",
    hsnCode: "90011000",
    keywords: ["optical", "spectacles", "glasses"],
  },
  {
    name: "PAPER",
    hsnCode: "48020000",
    keywords: ["paper", "sheets", "paper sheets"],
  },
  {
    name: "PEN DRIVE",
    hsnCode: "85230000",
    keywords: ["pen drive", "usb drive", "flash drive"],
  },
  {
    name: "POLYESTER COAT",
    hsnCode: "62014090",
    keywords: ["polyester coat", "coat", "overcoat"],
  },
  {
    name: "PRINTING CARD",
    hsnCode: "49090000",
    keywords: ["printing card", "printed card"],
  },
  {
    name: "SANITARY PAD",
    hsnCode: "96190010",
    keywords: ["sanitary pad", "sanitary napkin", "pad"],
  },
  {
    name: "SHOES",
    hsnCode: "64035119",
    keywords: ["shoes", "shoe", "footwear"],
  },
  {
    name: "SILK SAREE",
    hsnCode: "50072010",
    keywords: ["silk saree", "sari", "silk sari"],
  },
  {
    name: "SLIPPER",
    hsnCode: "64052000",
    keywords: ["slipper", "chappal", "sandals"],
  },
  {
    name: "SNACKS",
    hsnCode: "95049090",
    keywords: ["snacks", "chips", "namkeen"],
  },
  {
    name: "SOCKS",
    hsnCode: "61159500",
    keywords: ["socks", "sock", "foot socks"],
  },
  {
    name: "SPICES",
    hsnCode: "13019044",
    keywords: ["spices", "masala", "herbs"],
  },
  {
    name: "STICKERS",
    hsnCode: "48210000",
    keywords: ["stickers", "sticker", "decal"],
  },
  {
    name: "SYNTHETIC COAT",
    hsnCode: "62031200",
    keywords: ["synthetic coat", "raincoat", "jacket"],
  },
  {
    name: "TABLE COVER",
    hsnCode: "63071090",
    keywords: ["table cover", "table cloth"],
  },
  { name: "TOY", hsnCode: "95030099", keywords: ["toy", "toys", "plaything"] },
  {
    name: "UMBRELLA",
    hsnCode: "66010000",
    keywords: ["umbrella", "rain umbrella"],
  },
  {
    name: "UTENSILS",
    hsnCode: "73239990",
    keywords: ["utensils", "utensil", "kitchenware"],
  },
  {
    name: "WOOLEN BLANKET",
    hsnCode: "63012000",
    keywords: ["woolen blanket", "wool blanket"],
  },
  {
    name: "WOOLEN HOODIE",
    hsnCode: "61101120",
    keywords: ["woolen hoodie", "hoodie", "hoody"],
  },
  {
    name: "WOOLEN INNER",
    hsnCode: "61079920",
    keywords: ["woolen inner", "thermal wear"],
  },
  {
    name: "WOOLEN JACKET",
    hsnCode: "61101120",
    keywords: ["woolen jacket", "jacket", "wool jacket"],
  },
  {
    name: "WOOLEN MUFFLER",
    hsnCode: "62142090",
    keywords: ["woolen muffler", "muffler", "scarf"],
  },
  {
    name: "WOOLEN SHAWL",
    hsnCode: "62142010",
    keywords: ["woolen shawl", "shawl", "wool shawl"],
  },
  {
    name: "WOOLEN SWEATER",
    hsnCode: "61101120",
    keywords: ["woolen sweater", "sweater", "wool sweater"],
  },
  {
    name: "WOOLEN TRACK SUIT",
    hsnCode: "61121920",
    keywords: ["woolen track suit", "tracksuit", "sportswear"],
  },
  {
    name: "BANDAGE",
    hsnCode: "30059040",
    keywords: ["bandage", "gauze", "medical bandage"],
  },
  {
    name: "CERAMIC UTENSIL",
    hsnCode: "69111029",
    keywords: ["ceramic utensil", "ceramic ware"],
  },
  {
    name: "COTTON LONG DRESS",
    hsnCode: "62044290",
    keywords: ["cotton long dress", "long dress", "gown"],
  },
  {
    name: "COTTON NIGHT SUIT",
    hsnCode: "61083100",
    keywords: ["cotton night suit", "night suit", "pajama set"],
  },
  {
    name: "COTTON PILLOW",
    hsnCode: "94049099",
    keywords: ["cotton pillow", "pillow", "cushion"],
  },
  {
    name: "COTTON SAREE",
    hsnCode: "52085900",
    keywords: ["cotton saree", "cotton sari"],
  },
  {
    name: "COTTON STOLE",
    hsnCode: "62149099",
    keywords: ["cotton stole", "stole", "wrap"],
  },
  {
    name: "MEN PURSE",
    hsnCode: "42023120",
    keywords: ["men purse", "wallet", "money purse"],
  },
  {
    name: "PHOTO FRAME",
    hsnCode: "44149000",
    keywords: ["photo frame", "picture frame"],
  },
  {
    name: "PLASTIC UTENSILS",
    hsnCode: "39249090",
    keywords: ["plastic utensils", "plastic ware"],
  },
  {
    name: "RUBBER BAND",
    hsnCode: "40169920",
    keywords: ["rubber band", "elastic band"],
  },
  {
    name: "STATIONARY",
    hsnCode: "48209090",
    keywords: ["stationary", "stationery", "office supplies"],
  },
  {
    name: "STEEL UTENSILS",
    hsnCode: "73239990",
    keywords: ["steel utensils", "steel ware"],
  },
  {
    name: "SUN GLASS",
    hsnCode: "90041000",
    keywords: ["sun glass", "sunglasses", "shades"],
  },
  {
    name: "WOOLEN COAT",
    hsnCode: "62012010",
    keywords: ["woolen coat", "wool coat"],
  },
  {
    name: "COTTON FROCK",
    hsnCode: "62044290",
    keywords: ["cotton frock", "frock", "dress"],
  },
  {
    name: "COTTON HAIR BAND",
    hsnCode: "40169920",
    keywords: ["cotton hair band", "hair band"],
  },
  {
    name: "COTTON LACE",
    hsnCode: "58043000",
    keywords: ["cotton lace", "lace", "trimming"],
  },
  {
    name: "COTTON MAT",
    hsnCode: "57050042",
    keywords: ["cotton mat", "mat", "rug"],
  },
  {
    name: "COTTON SOCKS",
    hsnCode: "61159500",
    keywords: ["cotton socks", "socks"],
  },
  {
    name: "HAND GLOVES",
    hsnCode: "61169990",
    keywords: ["hand gloves", "gloves"],
  },
  {
    name: "KITCHENWARE",
    hsnCode: "39249090",
    keywords: ["kitchenware", "kitchen utensils"],
  },
  {
    name: "PAPER BAG",
    hsnCode: "48191090",
    keywords: ["paper bag", "carry bag"],
  },
  {
    name: "PHOTOFRAME",
    hsnCode: "44149000",
    keywords: ["photoframe", "frame"],
  },
  {
    name: "PLASTIC MOBILE COVER",
    hsnCode: "39269099",
    keywords: ["plastic mobile cover", "phone cover"],
  },
  {
    name: "SILK LEHENGA",
    hsnCode: "62042919",
    keywords: ["silk lehenga", "silk lehnga"],
  },
  { name: "TOWEL", hsnCode: "63049260", keywords: ["towel", "bath towel"] },
  {
    name: "WOOLEN LOWER",
    hsnCode: "61034990",
    keywords: ["woolen lower", "wool pajama"],
  },
  { name: "ALBUM", hsnCode: "48205000", keywords: ["album", "photo album"] },
  {
    name: "COTTON TRACK SUIT",
    hsnCode: "61121100",
    keywords: ["cotton track suit", "tracksuit"],
  },
  { name: "TEA", hsnCode: "21012010", keywords: ["tea", "chai"] },
  {
    name: "CRICKET BAT",
    hsnCode: "95069920",
    keywords: ["cricket bat", "bat"],
  },
  {
    name: "CRICKET BALL",
    hsnCode: "95066920",
    keywords: ["cricket ball", "ball"],
  },
  {
    name: "COTTON MASK",
    hsnCode: "63079090",
    keywords: ["cotton mask", "face mask"],
  },
  {
    name: "SYNTHETIC STONE",
    hsnCode: "68100000",
    keywords: ["synthetic stone", "artificial stone"],
  },
  {
    name: "COTTON SCARF",
    hsnCode: "62149040",
    keywords: ["cotton scarf", "scarf"],
  },
  { name: "POUCH", hsnCode: "39230000", keywords: ["pouch", "small bag"] },
  {
    name: "DOOR HANGING",
    hsnCode: "39269099",
    keywords: ["door hanging", "door decor"],
  },
  { name: "PAMPHLET", hsnCode: "49011020", keywords: ["pamphlet", "brochure"] },
  {
    name: "TAPE ROLL",
    hsnCode: "39190000",
    keywords: ["tape roll", "adhesive tape"],
  },
  {
    name: "RAINCOAT",
    hsnCode: "62011210",
    keywords: ["raincoat", "rain coat"],
  },
  {
    name: "MIRROR",
    hsnCode: "70090000",
    keywords: ["mirror", "looking glass"],
  },
  {
    name: "SHERWANI",
    hsnCode: "62031910",
    keywords: ["sherwani", "traditional wear"],
  },
  {
    name: "ADAPTER",
    hsnCode: "85366990",
    keywords: ["adapter", "electric adapter"],
  },
  { name: "ROPE", hsnCode: "56070000", keywords: ["rope", "cord"] },
  {
    name: "BATHWARE",
    hsnCode: "39220000",
    keywords: ["bathware", "bathroom ware"],
  },
  {
    name: "BUCKRAM",
    hsnCode: "59019090",
    keywords: ["buckram", "stiff cloth"],
  },
  {
    name: "PLASTIC PHONE COVER",
    hsnCode: "39269099",
    keywords: ["plastic phone cover", "mobile cover"],
  },
  {
    name: "ROTI MAKER",
    hsnCode: "85166000",
    keywords: ["roti maker", "chapati maker"],
  },
  {
    name: "STICKER",
    hsnCode: "48211010",
    keywords: ["sticker", "adhesive sticker"],
  },
  { name: "POUCHES", hsnCode: "39232990", keywords: ["pouches", "small bags"] },
  { name: "PLUG", hsnCode: "85360000", keywords: ["plug", "electric plug"] },
  { name: "ROLL", hsnCode: "48030000", keywords: ["roll", "paper roll"] },
  {
    name: "PILLOW COVER",
    hsnCode: "63040000",
    keywords: ["pillow cover", "pillow case"],
  },
  { name: "PILLOW", hsnCode: "94040000", keywords: ["pillow", "cushion"] },
  { name: "CABLE", hsnCode: "85440000", keywords: ["cable", "wire", "cord"] },
  {
    name: "GROCERIES",
    hsnCode: "19040000",
    keywords: ["groceries", "food items"],
  },
  {
    name: "RAIN COAT",
    hsnCode: "62011210",
    keywords: ["rain coat", "raincoat"],
  },
  { name: "BANGLES", hsnCode: "70181010", keywords: ["bangles", "bangle"] },
  {
    name: "POLY BAG",
    hsnCode: "39232100",
    keywords: ["poly bag", "plastic bag"],
  },
  {
    name: "CALENDAR",
    hsnCode: "49100000",
    keywords: ["calendar", "desk calendar"],
  },
  {
    name: "JUMP ROPE",
    hsnCode: "95069990",
    keywords: ["jump rope", "skipping rope"],
  },
  {
    name: "LUNCH BOX",
    hsnCode: "39240000",
    keywords: ["lunch box", "tiffin box"],
  },
  {
    name: "WOOLEN SCARF",
    hsnCode: "62140000",
    keywords: ["woolen scarf", "wool scarf"],
  },
  {
    name: "RUBBER PIPE",
    hsnCode: "40090000",
    keywords: ["rubber pipe", "hose"],
  },
  { name: "POSTER", hsnCode: "49111010", keywords: ["poster", "wall poster"] },
  {
    name: "MUSICAL INSTRUMENT",
    hsnCode: "92010000",
    keywords: ["musical instrument", "instrument"],
  },
  {
    name: "TISSUE PAPER",
    hsnCode: "48025450",
    keywords: ["tissue paper", "tissue"],
  },
  { name: "COTTON", hsnCode: "52010000", keywords: ["cotton", "raw cotton"] },
  { name: "STATUE", hsnCode: "97030020", keywords: ["statue", "sculpture"] },
  {
    name: "PARANDI",
    hsnCode: "63079090",
    keywords: ["parandi", "hair accessory"],
  },
  {
    name: "COOKER GASKET",
    hsnCode: "73219000",
    keywords: ["cooker gasket", "pressure cooker gasket"],
  },
  {
    name: "PLASTIC SHEET",
    hsnCode: "39200000",
    keywords: ["plastic sheet", "plastic film"],
  },
  {
    name: "KNEE SUPPORT",
    hsnCode: "90211000",
    keywords: ["knee support", "knee guard"],
  },
  {
    name: "TOOTH BRUSH",
    hsnCode: "96032100",
    keywords: ["tooth brush", "toothbrush"],
  },
  { name: "SCRUB", hsnCode: "33049990", keywords: ["scrub", "body scrub"] },
  { name: "MASK", hsnCode: "63079090", keywords: ["mask", "face mask"] },
  {
    name: "INHALER",
    hsnCode: "30040000",
    keywords: ["inhaler", "asthma inhaler"],
  },
  {
    name: "BRASS UTENSILS",
    hsnCode: "74181021",
    keywords: ["brass utensils", "brass ware"],
  },
  { name: "BUTTON", hsnCode: "96062100", keywords: ["button", "shirt button"] },
  { name: "CARPET", hsnCode: "57031010", keywords: ["carpet", "rug", "mat"] },
  {
    name: "COTTON APRON",
    hsnCode: "42034010",
    keywords: ["cotton apron", "apron"],
  },
  {
    name: "COTTON KITCHEN TOWEL",
    hsnCode: "63049260",
    keywords: ["cotton kitchen towel", "kitchen towel"],
  },
  {
    name: "COTTON KURTI",
    hsnCode: "61149090",
    keywords: ["cotton kurti", "kurti"],
  },
  {
    name: "COTTON SKIRT",
    hsnCode: "62045290",
    keywords: ["cotton skirt", "skirt"],
  },
  {
    name: "COTTON TABLE COVER",
    hsnCode: "63071090",
    keywords: ["cotton table cover", "table cloth"],
  },
  {
    name: "CRICKET HELMET",
    hsnCode: "65061090",
    keywords: ["cricket helmet", "helmet"],
  },
  {
    name: "CRICKET PAD",
    hsnCode: "95069920",
    keywords: ["cricket pad", "leg pad"],
  },
  { name: "CURTAIN", hsnCode: "63039990", keywords: ["curtain", "drape"] },
  {
    name: "DECORATIVE ITEMS",
    hsnCode: "69139000",
    keywords: ["decorative items", "decor"],
  },
  {
    name: "GLASS UTENSILS",
    hsnCode: "70131000",
    keywords: ["glass utensils", "glass ware"],
  },
  {
    name: "HANGER",
    hsnCode: "39269099",
    keywords: ["hanger", "clothes hanger"],
  },
  { name: "KEY RING", hsnCode: "42023120", keywords: ["key ring", "keychain"] },
  {
    name: "MUSIC INSTRUMENT TABLA",
    hsnCode: "92071000",
    keywords: ["music instrument tabla", "tabla"],
  },
  {
    name: "PLASTIC BAG",
    hsnCode: "39232100",
    keywords: ["plastic bag", "polythene bag"],
  },
  {
    name: "PLASTIC BASKET",
    hsnCode: "39249090",
    keywords: ["plastic basket", "basket"],
  },
  {
    name: "PLASTIC BOTTLE",
    hsnCode: "39233090",
    keywords: ["plastic bottle", "bottle"],
  },
  {
    name: "PLASTIC UTENSIL",
    hsnCode: "39249090",
    keywords: ["plastic utensil", "plastic spoon"],
  },
  {
    name: "TEMPERED GLASS",
    hsnCode: "70071900",
    keywords: ["tempered glass", "safety glass"],
  },
  {
    name: "WAX STRIPS",
    hsnCode: "48236900",
    keywords: ["wax strips", "hair removal strips"],
  },
  {
    name: "WOOLEN BABY DRESS",
    hsnCode: "61119090",
    keywords: ["woolen baby dress", "wool baby dress"],
  },
  {
    name: "WOOLEN SHRUG",
    hsnCode: "62114999",
    keywords: ["woolen shrug", "shrug"],
  },
  {
    name: "WOOLEN SOCKS",
    hsnCode: "61159400",
    keywords: ["woolen socks", "wool socks"],
  },
  {
    name: "WOOLEN SWEATSHIRT",
    hsnCode: "61059090",
    keywords: ["woolen sweatshirt", "sweatshirt"],
  },
  {
    name: "WRIST BAND",
    hsnCode: "40169920",
    keywords: ["wrist band", "wristband"],
  },
];

const ShipmentAndPackageDetail = ({
  register,
  onNext,
  onPrev,
  watch,
  setValue,
  step,
  totalActualWt,
  setTotalActualWt,
  totalVolumetricWt,
  setTotalVolumetricWt,
}) => {
  const selectedGoodstype = watch("goodstype", "Non-Document");
  const [boxCount, setBoxCount] = useState(1);
  const [selectedBox, setSelectedBox] = useState(1);
  const [tables, setTables] = useState({ 1: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [exportersDB, setExportersDB] = useState([]);
  const [exportersDBRef, setExportersDBRef] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const { server } = useContext(GlobalContext);
  const menuRef = useRef(null);
  const { data: session } = useSession();
  const accountCode = session?.user?.accountCode;

  const { formData } = useFormData();

  // ── NEW: dropdown suggestion state ──────────────────────────────
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionRef = useRef(null);
  const contextInputRef = useRef(null);
  // ────────────────────────────────────────────────────────────────

  // State for HSN notification
  const [hsnNotification, setHsnNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onYes: null,
  });

  const openConfirm = ({ title, message, onYes }) => {
    setConfirmModal({ open: true, title, message, onYes });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, title: "", message: "", onYes: null });
  };

  // Load saved data
  useEffect(() => {
    if (!formData || !formData.shipmentAndPackageDetails) return;

    const boxKeys = Object.keys(formData.shipmentAndPackageDetails);
    setBoxCount(boxKeys.length);
    setSelectedBox(1);
    setTables(formData.shipmentAndPackageDetails);

    if (formData.boxes) {
      setBoxes(formData.boxes);
    }

    if (formData.totalActualWt) setTotalActualWt(formData.totalActualWt);
    if (formData.totalVolWt) setTotalVolumetricWt(formData.totalVolWt);

    Object.keys(formData).forEach((key) => {
      setValue(key, formData[key]);
    });
  }, [formData]);

  const exportersOptions = exportersDB.map((exp) => ({
    label: exp.name,
    value: exp.name,
    extra: `KYC: ${exp.kyc} | IEC: ${exp.iec} | GST: ${exp.gst} | AD: ${exp.adCode}`,
  }));

  const termsOptions = [
    { label: "CIF", value: "CIF" },
    { label: "FOB", value: "FOB" },
  ];

  useEffect(() => {
    async function fetchExporters() {
      try {
        const res = await axios.get(
          `${server}/portal/csb-setting?accountCode=${accountCode}`
        );
        setExportersDB(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch exporters", err);
      }
    }
    fetchExporters();
  }, [accountCode, exportersDBRef]);

  useEffect(() => {
    const selectedName = watch("exporter");
    if (!selectedName) return;

    const selectedExp = exportersDB.find((e) => e.name === selectedName);
    if (!selectedExp) return;

    setValue("kycNumber", selectedExp.kyc || "");
    setValue("iec", selectedExp.iec || "");
    setValue("gstNumber", selectedExp.gst || "");
    setValue("adCode", selectedExp.adCode || "");
    setValue("termsOfInvoice", selectedExp.termsOfInvoice || "");
    setValue("crnNumber", selectedExp.crnNumber || "");
    setValue("mhbsNumber", selectedExp.mhbsNumber || "");
    setValue(
      "exportThroughEcommerce",
      selectedExp.exportThroughEcommerce || false
    );
    setValue("meisScheme", selectedExp.meisScheme || false);
  }, [watch("exporter"), exportersDB]);

  const handleAddExporter = async () => {
    const name = watch("exporter");
    const kyc = watch("kycNumber");
    const iec = watch("iec");
    const gst = watch("gstNumber");
    const adCode = watch("adCode");
    const termsOfInvoice = watch("termsOfInvoice");
    const crnNumber = watch("crnNumber");
    const mhbsNumber = watch("mhbsNumber");
    const exportThroughEcommerce = watch("exportThroughEcommerce");
    const meisScheme = watch("meisScheme");

    if (!name || !kyc || !iec) {
      openConfirm({
        title: "Validation Error",
        message: "Name, KYC & IEC are required!",
        onYes: closeConfirm,
      });
      return;
    }

    const newExporter = {
      name,
      kyc,
      iec,
      gst,
      adCode,
      termsOfInvoice,
      crnNumber,
      mhbsNumber,
      accountCode,
      exportThroughEcommerce,
      meisScheme,
    };

    try {
      const res = await axios.post(`${server}/portal/csb-setting`, newExporter);
      openConfirm({
        title: "Success",
        message: "Exporter saved successfully!",
        onYes: closeConfirm,
      });

      if (res.data) {
        setExportersDBRef(!exportersDBRef);
        setValue("kycNumber", "");
        setValue("iec", "");
        setValue("gstNumber", "");
        setValue("adCode", "");
        setValue("termsOfInvoice", "");
        setValue("crnNumber", "");
        setValue("mhbsNumber", "");
        setValue("exportThroughEcommerce", false);
        setValue("meisScheme", false);
      }
    } catch (err) {
      console.error("Failed to add exporter:", err);
      openConfirm({
        title: "Error",
        message: err?.response?.data?.error || "Failed to add exporter",
        onYes: closeConfirm,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Close suggestion dropdown when clicking outside
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        contextInputRef.current &&
        !contextInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [boxes, setBoxes] = useState([
    {
      volumetricWeight: 0,
      totalWeight: 0,
      dimensionSummary: "",
      context: "",
      hsnNo: "",
      qty: 0,
      rate: 0,
      amount: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);

  // ── NEW: Get suggestions from PRODUCT_DATABASE based on input ──
  const getProductSuggestions = (input) => {
    if (!input || input.trim().length < 1) return [];
    const searchTerm = input.toLowerCase().trim();

    const seen = new Set();
    const results = [];

    for (const product of PRODUCT_DATABASE) {
      if (seen.has(product.name)) continue;

      const nameMatch = product.name.toLowerCase().includes(searchTerm);
      const keywordMatch = product.keywords.some((kw) =>
        kw.toLowerCase().includes(searchTerm)
      );

      if (nameMatch || keywordMatch) {
        seen.add(product.name);
        results.push(product);
        if (results.length >= 8) break; // cap at 8 suggestions
      }
    }

    return results;
  };

  // ── NEW: Handle selecting a product from the dropdown ──────────
  const handleSelectSuggestion = (product) => {
    // Update context (description) and hsnNo together
    setBoxes((prevBoxes) => {
      const newBoxes = [...prevBoxes];
      newBoxes[0] = {
        ...newBoxes[0],
        context: product.name,
        hsnNo: product.hsnCode,
      };
      return newBoxes;
    });

    setShowSuggestions(false);
    setHighlightedIndex(-1);

    // Show success notification
    setHsnNotification({
      show: true,
      message: `HSN Code ${product.hsnCode} auto-filled for "${product.name}"`,
      type: "success",
    });

    const timer = setTimeout(() => {
      setHsnNotification((prev) => ({ ...prev, show: false }));
    }, 3000);

    return () => clearTimeout(timer);
  };

  // ── NEW: Handle context input change with live suggestions ─────
  const handleContextChange = (value) => {
    handleInputChange(0, "context", value);
    handleInputChange(0, "hsnNo", ""); // clear HSN when user types manually

    const matched = getProductSuggestions(value);
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0 && value.trim().length > 0);
    setHighlightedIndex(-1);
  };

  // ── NEW: Keyboard navigation for suggestions ───────────────────
  const handleContextKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };
  // ────────────────────────────────────────────────────────────────

  // Calculate totals whenever boxes change
  useEffect(() => {
    const totalWt = boxes.reduce(
      (sum, box) => sum + parseFloat(box.totalWeight || 0),
      0
    );
    setTotalActualWt(totalWt);
    setValue("totalActualWt", totalWt);

    const totalVolWt = boxes.reduce(
      (sum, box) => sum + parseFloat(box.volumetricWeight || 0),
      0
    );
    setTotalVolumetricWt(totalVolWt);
    setValue("totalVolWt", totalVolWt);

    const totalAmt = boxes.reduce(
      (sum, box) => sum + parseFloat(box.amount || 0),
      0
    );
    setValue("totalInvoiceValue", totalAmt);
    setValue("boxes", boxes);
  }, [boxes, setTotalActualWt, setTotalVolumetricWt, setValue]);

  const calculateVolumetricWeight = (box) => {
    const length = parseFloat(box.length) || 0;
    const width = parseFloat(box.width) || 0;
    const height = parseFloat(box.height) || 0;

    if (length > 0 && width > 0 && height > 0) {
      return ((length * width * height) / 5000).toFixed(2);
    }
    return 0;
  };

  const calculateTotalWeight = (box) => {
    const weight = parseFloat(box.weight);
    return !isNaN(weight) ? weight.toFixed(2) : "0.00";
  };

  const calculateDimensionSummary = (box) => {
    const length = box.length || 0;
    const width = box.width || 0;
    const height = box.height || 0;
    return `${length} x ${width} x ${height} cm`;
  };

  useEffect(() => {
    if (tables[selectedBox]) {
      const invoiceValue = tables[selectedBox].reduce(
        (total, item) => total + (parseFloat(item.amount) || 0),
        0
      );
      setTotalAmount(invoiceValue);
    }
  }, [selectedBox, tables]);

  useEffect(() => {
    setValue("shipmentAndPackageDetails", tables);
  }, [tables, setValue]);

  const handleInputChange = (index, field, value) => {
    const newBoxes = [...boxes];
    newBoxes[index][field] = value;

    if (field === "qty" || field === "rate") {
      newBoxes[index].amount =
        (parseFloat(newBoxes[index].qty) || 0) *
        (parseFloat(newBoxes[index].rate) || 0);
    }

    newBoxes[index].volumetricWeight = calculateVolumetricWeight(
      newBoxes[index]
    );
    newBoxes[index].totalWeight = calculateTotalWeight(newBoxes[index]);
    newBoxes[index].dimensionSummary = calculateDimensionSummary(
      newBoxes[index]
    );

    setBoxes(newBoxes);
  };

  const addNewBox = () => {
    setBoxCount((prevBoxCount) => {
      const newBoxNumber = prevBoxCount + 1;
      setTables((prevTables) => ({
        ...prevTables,
        [newBoxNumber]: [],
      }));

      setBoxes((prevBoxes) => [
        ...prevBoxes,
        {
          volumetricWeight: 0,
          totalWeight: 0,
          dimensionSummary: "",
          context: "",
          hsnNo: "",
          qty: 0,
          rate: 0,
          amount: 0,
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
        },
      ]);

      setSelectedBox(newBoxNumber);
      return newBoxNumber;
    });
  };

  const handleAddRow = () => {
    if (editingItem !== null) {
      setTables((prevTables) => {
        const updatedTables = { ...prevTables };
        updatedTables[selectedBox][editingItem] = {
          context: boxes[0].context,
          hsnNo: boxes[0].hsnNo,
          qty: parseFloat(boxes[0].qty) || 0,
          rate: parseFloat(boxes[0].rate) || 0,
          amount:
            (parseFloat(boxes[0].qty) || 0) *
            (parseFloat(boxes[0].rate) || 0),
        };
        return updatedTables;
      });
      setEditingItem(null);
    } else {
      const newRow = {
        context: boxes[0].context,
        hsnNo: boxes[0].hsnNo,
        qty: parseFloat(boxes[0].qty) || 0,
        rate: parseFloat(boxes[0].rate) || 0,
        amount:
          (parseFloat(boxes[0].qty) || 0) * (parseFloat(boxes[0].rate) || 0),
      };

      setTables((prevTables) => {
        const updatedTables = { ...prevTables };
        if (!updatedTables[selectedBox]) {
          updatedTables[selectedBox] = [];
        }
        updatedTables[selectedBox] = [...updatedTables[selectedBox], newRow];
        return updatedTables;
      });
    }

    setBoxes((prevBoxes) => [
      { ...prevBoxes[0], context: "", hsnNo: "", qty: 0, rate: 0 },
      ...prevBoxes.slice(1),
    ]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleEditItem = (index) => {
    const item = tables[selectedBox][index];
    setBoxes((prevBoxes) => [
      {
        ...prevBoxes[0],
        context: item.context,
        hsnNo: item.hsnNo,
        qty: item.qty,
        rate: item.rate,
      },
      ...prevBoxes.slice(1),
    ]);
    setEditingItem(index);
    document
      .getElementById("context")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDeleteItem = (index) => {
    openConfirm({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      onYes: () => {
        setTables((prevTables) => {
          const updated = { ...prevTables };
          updated[selectedBox] = updated[selectedBox].filter(
            (_, i) => i !== index
          );
          return updated;
        });

        if (editingItem === index) {
          setEditingItem(null);
          setBoxes((prev) => [
            { ...prev[0], context: "", hsnNo: "", qty: 0, rate: 0 },
            ...prev.slice(1),
          ]);
        }
        closeConfirm();
      },
    });
  };

  const handleDuplicateBox = () => {
    const currentBoxData = boxes[selectedBox - 1];
    const currentTableData = tables[selectedBox] || [];

    setBoxCount((prevBoxCount) => {
      const newBoxNumber = prevBoxCount + 1;
      setTables((prevTables) => ({
        ...prevTables,
        [newBoxNumber]: [...currentTableData],
      }));

      setBoxes((prevBoxes) => [...prevBoxes, { ...currentBoxData }]);
      setSelectedBox(newBoxNumber);
      return newBoxNumber;
    });

    setIsOpen(false);
  };

  const handleDeleteBox = () => {
    if (boxCount === 1) {
      openConfirm({
        title: "Action Not Allowed",
        message: "You cannot delete the last box.",
        onYes: closeConfirm,
      });
      return;
    }

    openConfirm({
      title: `Delete Box ${selectedBox}`,
      message: "This action cannot be undone. Do you want to continue?",
      onYes: () => {
        setBoxes((prev) => prev.filter((_, idx) => idx !== selectedBox - 1));

        setTables((prev) => {
          const updated = { ...prev };
          delete updated[selectedBox];

          const reindexed = {};
          let i = 1;
          Object.keys(updated)
            .sort((a, b) => Number(a) - Number(b))
            .forEach((k) => {
              reindexed[i++] = updated[k];
            });

          return reindexed;
        });

        setBoxCount((p) => p - 1);
        setSelectedBox(1);
        setIsOpen(false);
        closeConfirm();
      },
    });
  };

  const columns = () => [
    { key: "context", label: "Description" },
    { key: "hsnNo", label: "HSN Code" },
    { key: "qty", label: "Qty" },
    { key: "rate", label: "Rate" },
    { key: "amount", label: "Amt (₹)" },
  ];

  // ✅ Total invoice value across ALL boxes
  const totalInvoiceAllBoxes = Object.values(tables).reduce(
    (total, boxItems) => {
      if (!Array.isArray(boxItems)) return total;
      return (
        total +
        boxItems.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0
        )
      );
    },
    0
  );

  // ✅ Chargeable weight = max(actual, volumetric) rounded up
  const chargeableWt = Math.ceil(
    Math.max(totalActualWt || 0, totalVolumetricWt || 0)
  );

  return (
    <div className="bg-white flex flex-col gap-2 rounded-3xl p-10">
      {/* HSN Notification */}
      {hsnNotification.show && (
        <div
          className={`fixed top-20 right-5 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            hsnNotification.type === "success"
              ? "bg-green-50 border border-green-300 text-green-800"
              : "bg-red-50 border border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {hsnNotification.type === "success" ? "✅" : "⚠️"}
            </span>
            <span className="text-sm font-medium">
              {hsnNotification.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step <= 4 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/4.svg"
            alt="Step 4 indicator"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step > 4 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/done-red.svg"
            alt="Step 4 completed"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">
          Shipment and Package Details
        </h2>
      </div>

      <div
        className={`flex gap-2 items-start overflow-hidden transition-max-height duration-500 ease-in-out ${
          step === 4 ? "max-h-[10000px]" : "max-h-0"
        }`}
      >
        <div className="w-full flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold">Shipment Type</h4>
              <div className="flex gap-4">
                {["Non-Document", "Document", "Commercial (CSBV)"].map(
                  (type) => (
                    <label
                      key={type}
                      className={`flex font-medium gap-4 text-xs py-[15px] px-[39px] rounded-md cursor-pointer ${
                        selectedGoodstype === type
                          ? "bg-[#FFE5E9] text-[#EA1B40]"
                          : "bg-[#F8F8F8] text-[#979797]"
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("goodstype")}
                        value={type}
                        defaultChecked={type === "Non-Document"}
                        className={`${
                          selectedGoodstype === type
                            ? "accent-[#EA1B40]"
                            : "accent-[#979797]"
                        }`}
                      />
                      <div>{type}</div>
                    </label>
                  )
                )}
              </div>

              {selectedGoodstype === "Commercial (CSBV)" && (
                <div className="flex flex-col gap-8 mt-6">
                  {/* CSBV fields - keeping your existing implementation */}
                </div>
              )}

              <div className="flex justify-between">
                <div className="flex gap-4 text-center items-center">
                  <div>
                    <Image
                      src="/create-shipment/box-logo-step3.svg"
                      alt="Box icon"
                      width={36}
                      height={36}
                    />
                  </div>

                  {boxCount > 0 && (
                    <div>
                      <select
                        value={selectedBox || ""}
                        onChange={(e) => {
                          setSelectedBox(Number(e.target.value));
                          setEditingItem(null);
                        }}
                        className="ml-2 text-xl font-bold text-red-600 px-1 py-1 rounded-md"
                      >
                        {Array.from({ length: boxCount }).map((_, index) => {
                          const boxIndex = index + 1;
                          return (
                            <option key={boxIndex} value={boxIndex}>
                              Box {boxIndex}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* ✅ Updated weight/invoice display bar */}
                <div className="flex gap-2 flex-row-reverse flex-wrap">
                  <div className="bg-[#FFF3CD] text-xs text-[#979797] px-[16px] py-[15px] rounded-md gap-2 flex">
                    <div className="flex gap-3">
                      <span>Total Invoice:</span>
                      <div className="flex gap-3">
                        <div>₹ {totalInvoiceAllBoxes.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#E8F4FD] text-xs text-[#979797] px-[16px] py-[15px] rounded-md gap-2 flex">
                    <div className="flex gap-3">
                      <span>Chargeable Wt:</span>
                      <div className="flex gap-3">
                        <div>{chargeableWt}</div>
                        <span>Kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#D8F3E0] text-xs text-[#979797] px-[16px] py-[15px] rounded-md gap-2 flex">
                    <div className="flex gap-3">
                      <span>Total Vol. Weight:</span>
                      <div className="flex gap-3">
                        <div>{totalVolumetricWt.toFixed(2)}</div>
                        <span>Kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#D8F3E0] text-xs text-[#979797] p-4 rounded-md gap-2 flex">
                    <div className="flex gap-3">
                      <span>Total Actual Weight:</span>
                      <div className="flex gap-3">
                        <div>{totalActualWt.toFixed(2)}</div>
                        <span>Kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gap-4 flex flex-col">
              <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                  <div className="flex w-full gap-28">
                    <div className="flex w-full flex-col gap-2">
                      <h3 className="font-semibold">Actual Weight of Box</h3>
                      <div className="relative overflow-hidden rounded-md w-[20vw] border-[#979797] border">
                        <input
                          type="number"
                          {...register("weight")}
                          onChange={(e) =>
                            handleInputChange(
                              selectedBox - 1,
                              "weight",
                              e.target.value
                            )
                          }
                          value={boxes[selectedBox - 1]?.weight || 0}
                          placeholder="Weight"
                          className="rounded-md px-2 w-full py-3 outline-none"
                        />
                        <div className="bg-[#F3F7FE] text-[#979797] w-10 flex items-center justify-center absolute top-0 bottom-0 right-0">
                          Kg
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold">Dimensions of the Box</h3>
                      <div className="flex gap-4">
                        {["length", "width", "height"].map((dimension) => (
                          <div
                            key={dimension}
                            className="relative overflow-hidden w-[10vw] rounded-md border-[#979797] border"
                          >
                            <input
                              type="number"
                              {...register(dimension)}
                              onChange={(e) =>
                                handleInputChange(
                                  selectedBox - 1,
                                  dimension,
                                  e.target.value
                                )
                              }
                              value={
                                boxes[selectedBox - 1]?.[dimension] || 0
                              }
                              placeholder={
                                dimension.charAt(0).toUpperCase() +
                                dimension.slice(1)
                              }
                              className="rounded-md px-2 py-3 w-24 outline-none"
                            />
                            <div className="bg-[#F3F7FE] text-[#979797] w-10 flex items-center justify-center absolute top-0 bottom-0 right-0">
                              cm
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice items section */}
              <div className="flex w-full flex-wrap justify-between">
                {/* ── UPDATED: Package Description with suggestion dropdown ── */}
                <div id="context" className="flex w-[20vw] flex-col gap-2">
                  <h3>Package Description</h3>
                  <div className="relative">
                    <input
                      ref={contextInputRef}
                      type="text"
                      value={boxes[0]?.["context"] || ""}
                      onChange={(e) => handleContextChange(e.target.value)}
                      onKeyDown={handleContextKeyDown}
                      onFocus={() => {
                        if (
                          suggestions.length > 0 &&
                          boxes[0]?.context?.trim()
                        ) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Type item name..."
                      autoComplete="off"
                      className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div
                        ref={suggestionRef}
                        className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto"
                      >
                        {suggestions.map((product, idx) => (
                          <div
                            key={product.name}
                            onMouseDown={(e) => {
                              // use onMouseDown so it fires before onBlur
                              e.preventDefault();
                              handleSelectSuggestion(product);
                            }}
                            className={`flex items-center justify-between px-3 py-2 cursor-pointer text-xs transition-colors ${
                              idx === highlightedIndex
                                ? "bg-[#FFE5E9] text-[#EA1B40]"
                                : "hover:bg-[#FFF5F7] text-gray-700"
                            }`}
                          >
                            <span className="font-medium">{product.name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                idx === highlightedIndex
                                  ? "bg-[#EA1B40] text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {product.hsnCode}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* ─────────────────────────────────────────────────────── */}

                <div className="flex gap-4 items-end">
                  {["hsnNo", "qty", "rate"].map((field) => (
                    <div key={field} className="flex flex-col gap-2 w-full">
                      <h3>
                        {field === "hsnNo"
                          ? "HSN Code"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </h3>

                      {field === "qty" ? (
                        <div className="flex items-stretch overflow-hidden border-[#979797] border rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                0,
                                field,
                                Math.max(
                                  0,
                                  (parseFloat(boxes[0]?.[field]) || 0) - 1
                                )
                              )
                            }
                            className="px-2 bg-[#F3F7FE] w-10 text-base font-bold text-[#979797]"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={
                              (boxes[0]?.[field] || 0) < 1
                                ? ""
                                : boxes[0]?.[field] || ""
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : Math.max(
                                      0,
                                      parseFloat(e.target.value) || 0
                                    );
                              handleInputChange(0, field, value);
                            }}
                            placeholder="0"
                            className="px-2 py-3 w-12 outline-none text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                0,
                                field,
                                (parseFloat(boxes[0]?.[field]) || 0) + 1
                              )
                            }
                            className="px-2 bg-[#F3F7FE] w-10 text-base font-bold text-[#979797]"
                          >
                            +
                          </button>
                        </div>
                      ) : field === "hsnNo" ? (
                        <input
                          type="text"
                          value={boxes[0]?.[field] || ""}
                          onChange={(e) =>
                            handleInputChange(0, field, e.target.value)
                          }
                          placeholder="Auto-filled HSN"
                          className="border-[#979797] border rounded-md px-2 py-3 w-[14.5vw] outline-none bg-gray-50"
                          readOnly
                        />
                      ) : (
                        <input
                          type="number"
                          value={boxes[0]?.[field] || ""}
                          onChange={(e) =>
                            handleInputChange(0, field, e.target.value)
                          }
                          placeholder="0"
                          className="border-[#979797] border rounded-md px-2 py-3 w-[14.5vw] outline-none"
                        />
                      )}
                    </div>
                  ))}

                  <div className="w-[100px]">
                    <button
                      onClick={handleAddRow}
                      type="button"
                      className="h-10 w-[100px] border border-red-600 text-[var(--primary-color)] font-bold rounded-md hover:bg-red-50 transition-colors"
                    >
                      {editingItem !== null ? "Update" : "Add Item"}
                    </button>
                  </div>

                  {editingItem !== null && (
                    <div className="w-[100px]">
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setBoxes((prevBoxes) => [
                            {
                              ...prevBoxes[0],
                              context: "",
                              hsnNo: "",
                              qty: 0,
                              rate: 0,
                            },
                            ...prevBoxes.slice(1),
                          ]);
                        }}
                        type="button"
                        className="h-10 w-[100px] border border-gray-400 text-gray-600 font-bold rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={addNewBox}
                className="flex justify-start w-fit"
              >
                <div className="flex gap-3 items-center rounded border border-[var(--primary-color)] p-2 hover:bg-red-50 transition-colors">
                  <div>
                    <Image
                      src="/create-shipment/box-logo-step3.svg"
                      alt="Add new box icon"
                      width={16}
                      height={18}
                    />
                  </div>
                  <span className="text-[var(--primary-color)] text-nowrap font-bold text-base rounded-md">
                    Add New Box
                  </span>
                </div>
              </button>

              <div>
                {selectedBox && tables[selectedBox] !== undefined && (
                  <div className="mt-4 border p-5 rounded-lg">
                    <div className="flex justify-between gap-2 mb-9 items-center">
                      <div className="flex bg-[#FFE5E9] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-xl text-red-600 font-bold">
                          Box
                        </span>
                        <span className="text-xl text-red-600 font-bold">
                          {selectedBox}
                        </span>
                      </div>
                      <div className="flex bg-[#7676801F] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-[#667085]">Actual Weight:</span>
                        <span className="text-[#667085]">
                          {boxes[selectedBox - 1]?.totalWeight || 0} Kg
                        </span>
                      </div>
                      <div className="flex bg-[#7676801F] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-[#667085]">Dimensions:</span>
                        <span className="text-[#667085]">
                          {boxes[selectedBox - 1]?.dimensionSummary ||
                            "0 x 0 x 0 cm"}
                        </span>
                      </div>
                      <div className="flex bg-[#7676801F] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-[#667085]">Volume Weight:</span>
                        <span className="text-[#667085]">
                          {boxes[selectedBox - 1]?.volumetricWeight || 0} Kg
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex bg-[#F8F8F8] px-4 py-2 text-sm gap-1 items-center rounded-md">
                          <span className="text-[#EA1B40]">Box Invoice:</span>
                          <span className="text-[#EA1B40]">
                            ₹ {totalAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="relative z-10">
                          <div
                            className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                          >
                            <Image
                              src="/menu_bar.svg"
                              alt="Menu options"
                              width={5}
                              height={17}
                            />
                          </div>

                          {isOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-2 w-[230px] bg-white shadow-xl rounded-md p-2 border border-gray-200"
                            >
                              <ul className="text-sm flex flex-col gap-1">
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#F3F7FE] rounded transition-colors"
                                  onClick={() => {
                                    document
                                      .getElementById("context")
                                      ?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                      });
                                    setIsOpen(false);
                                  }}
                                >
                                  <Image
                                    src="/box_logo.svg"
                                    alt="Add items icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium">
                                    Add Items
                                  </span>
                                </li>
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#F3F7FE] rounded transition-colors"
                                  onClick={handleDuplicateBox}
                                >
                                  <Image
                                    src="/box_logo.svg"
                                    alt="Duplicate box icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium">
                                    Duplicate Box {selectedBox}
                                  </span>
                                </li>
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#FFE5E9] rounded transition-colors"
                                  onClick={handleDeleteBox}
                                >
                                  <Image
                                    src="/red_logo.svg"
                                    alt="Delete box icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium text-[#EA1B40]">
                                    Delete Box {selectedBox}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <TableWithCTA
                      register={register}
                      setValue={setValue}
                      name="shipmentAndPackageDetails"
                      columns={columns(selectedBox)}
                      rowData={tables[selectedBox] || []}
                      handleEdit={handleEditItem}
                      handleDelete={handleDeleteItem}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end items-center">
              <div className="flex gap-4">
                <button
                  className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3 hover:bg-red-50 transition-colors"
                  type="button"
                  onClick={onPrev}
                >
                  Back
                </button>
                <button
                  className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 hover:bg-red-700 transition-colors"
                  type="button"
                  onClick={onNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onYes={confirmModal.onYes}
        onNo={closeConfirm}
      />
    </div>
  );
};

export default ShipmentAndPackageDetail;

const ConfirmModal = ({ open, title, message, onYes, onNo }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-[360px] p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onNo}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            No
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};