// components/agregar-producto-form.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import ImageUploader from "./imageUploader";
import {
  Package,
  DollarSign,
  ImageIcon,
  Tag,
  FileText,
  Save,
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Flower2,
  Box,
  Layers,
  Ruler,
  Palette,
  Gem,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner"; // ✅ Importar Sonner

interface UploadedImage {
  publicId: string;
  url: string;
}

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  marca: string;
  aroma: string;
  linea: string;
  description: string;
  images: UploadedImage[];
  cantidad: string;
  tamaño?: string;
  color?: string;
  tipo?: string;
  piedra?: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  marca?: string;
  aroma?: string;
  linea?: string;
  description?: string;
  images?: string;
  cantidad?: string;
  tamaño?: string;
  color?: string;
  tipo?: string;
  piedra?: string;
  general?: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface MarcaOption {
  value: string;
  label: string;
}

interface AromaOption {
  value: string;
  label: string;
}

interface LineaOption {
  value: string;
  label: string;
}

interface TamañoOption {
  value: string;
  label: string;
}

interface ColorOption {
  value: string;
  label: string;
}

interface TipoOption {
  value: string;
  label: string;
}

interface PiedraOption {
  value: string;
  label: string;
}

interface ProductoExistente {
  id: number;
  name: string;
  stock: number;
  marca?: string;
  aroma?: string;
  linea?: string;
  tamaño?: string;
  color?: string;
  tipo?: string;
  piedra?: string;
  category: string;
}

export function AgregarProductoForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category: "",
    marca: "",
    aroma: "",
    linea: "",
    description: "",
    images: [],
    cantidad: "1",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadMode, setUploadMode] = useState<"single" | "multiple" | null>(
    null
  );
  const [productoExistente, setProductoExistente] =
    useState<ProductoExistente | null>(null);

  // Estados para opciones
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [marcas, setMarcas] = useState<MarcaOption[]>([]);
  const [aromas, setAromas] = useState<AromaOption[]>([]);
  const [lineas, setLineas] = useState<LineaOption[]>([]);
  const [tamaños, setTamaños] = useState<TamañoOption[]>([]);
  const [colores, setColores] = useState<ColorOption[]>([]);
  const [tipos, setTipos] = useState<TipoOption[]>([]);
  const [piedras, setPiedras] = useState<PiedraOption[]>([]);

  // Estados para inputs nuevos
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewMarcaInput, setShowNewMarcaInput] = useState(false);
  const [showNewAromaInput, setShowNewAromaInput] = useState(false);
  const [showNewLineaInput, setShowNewLineaInput] = useState(false);
  const [showNewTamañoInput, setShowNewTamañoInput] = useState(false);
  const [showNewColorInput, setShowNewColorInput] = useState(false);
  const [showNewTipoInput, setShowNewTipoInput] = useState(false);
  const [showNewPiedraInput, setShowNewPiedraInput] = useState(false);

  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [newMarcaValue, setNewMarcaValue] = useState("");
  const [newAromaValue, setNewAromaValue] = useState("");
  const [newLineaValue, setNewLineaValue] = useState("");
  const [newTamañoValue, setNewTamañoValue] = useState("");
  const [newColorValue, setNewColorValue] = useState("");
  const [newTipoValue, setNewTipoValue] = useState("");
  const [newPiedraValue, setNewPiedraValue] = useState("");

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Función para determinar qué campos requiere cada categoría
  const getCamposRequeridos = (category: string) => {
    if (!category)
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };

    const cat = category.toLowerCase();

    if (cat.includes("rocio aurico")) {
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (
      cat.includes("aromatizante de ambiente") ||
      cat.includes("aromatizante de ambientes")
    ) {
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (
      cat.includes("aromatizante para auto") ||
      cat.includes("aromatizante de auto")
    ) {
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("esencia")) {
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("incienso")) {
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("bombas de humo")) {
      return {
        marca: true,
        aroma: true,
        linea: true,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("vela")) {
      return {
        marca: true,
        aroma: false,
        linea: false,
        tamaño: true,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: true,
      };
    }
    if (cat.includes("cascada de humo")) {
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: true,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("estatua")) {
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: true,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("lampara de sal")) {
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: true,
        color: true,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("porta sahumerios")) {
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: true,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };
    }
    // ✨ NUEVA CATEGORÍA: CERÁMICA
    if (cat.includes("ceramica") || cat.includes("cerámica")) {
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: true,
        color: false,
        tipo: true, // Tipo es REQUERIDO para cerámica
        piedra: false,
        cantidad: false,
      };
    }
    if (cat.includes("accesorios")) {
      return {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: false,
        color: false,
        tipo: true,
        piedra: false,
        cantidad: false,
      };
    }
    // Para sahumerios y otros por defecto
    return {
      marca: true,
      aroma: true,
      linea: true,
      tamaño: false,
      color: false,
      tipo: false,
      piedra: false,
      cantidad: false,
    };
  };

  // Función para determinar si se requiere piedra (solo para collares en accesorios)
  const requierePiedra = (category: string, tipo: string) => {
    return (
      category.toLowerCase().includes("accesorios") &&
      tipo &&
      tipo.toLowerCase().includes("collar")
    );
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingOptions(true);

        const categoriesResponse = await fetch(
          "/api/agregarProd?getCategories=true"
        );
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success) {
            setCategories(
              categoriesData.data.map((cat: string) => ({
                value: cat,
                label: cat,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadCategories();
  }, []);

  // Cargar marcas cuando cambie la categoría (solo si la categoría requiere marca)
  useEffect(() => {
    const loadMarcas = async () => {
      const campos = getCamposRequeridos(formData.category);
      if (!formData.category || !campos.marca) {
        setMarcas([]);
        setAromas([]);
        setLineas([]);
        return;
      }

      try {
        const marcasResponse = await fetch(
          `/api/agregarProd?getMarcas=true&category=${encodeURIComponent(
            formData.category
          )}`
        );
        if (marcasResponse.ok) {
          const marcasData = await marcasResponse.json();
          if (marcasData.success) {
            setMarcas(
              marcasData.data.map((marca: string) => ({
                value: marca,
                label: marca,
              }))
            );
            if (formData.marca && !marcasData.data.includes(formData.marca)) {
              setFormData((prev) => ({
                ...prev,
                marca: "",
                aroma: "",
                linea: "",
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error cargando marcas:", error);
        setMarcas([]);
      }
    };

    loadMarcas();
  }, [formData.category, formData.marca]); // Agregar formData.marca como dependencia

  // Cargar aromas cuando cambien la categoría y marca (para categorías que requieren aroma)
  useEffect(() => {
    const loadAromas = async () => {
      const campos = getCamposRequeridos(formData.category);
      if (!formData.category || !formData.marca || !campos.aroma) {
        setAromas([]);
        return;
      }

      try {
        const aromasResponse = await fetch(
          `/api/agregarProd?getAromas=true&category=${encodeURIComponent(
            formData.category
          )}&marca=${encodeURIComponent(formData.marca)}`
        );
        if (aromasResponse.ok) {
          const aromasData = await aromasResponse.json();
          if (aromasData.success) {
            setAromas(
              aromasData.data.map((aroma: string) => ({
                value: aroma,
                label: aroma,
              }))
            );
            if (formData.aroma && !aromasData.data.includes(formData.aroma)) {
              setFormData((prev) => ({ ...prev, aroma: "" }));
            }
          }
        }
      } catch (error) {
        console.error("Error cargando aromas:", error);
        setAromas([]);
      }
    };

    loadAromas();
  }, [formData.category, formData.marca, formData.aroma]); // Agregar formData.aroma como dependencia

  // Cargar líneas cuando cambien la categoría, marca y aroma (para categorías que permiten línea)
  useEffect(() => {
    const loadLineas = async () => {
      const campos = getCamposRequeridos(formData.category);
      if (!formData.category || !formData.marca || !campos.linea) {
        setLineas([]);
        return;
      }

      try {
        const lineasResponse = await fetch(
          `/api/agregarProd?getLineas=true&category=${encodeURIComponent(
            formData.category
          )}&marca=${encodeURIComponent(
            formData.marca
          )}&aroma=${encodeURIComponent(formData.aroma || "")}`
        );
        if (lineasResponse.ok) {
          const lineasData = await lineasResponse.json();
          if (lineasData.success) {
            setLineas(
              lineasData.data.map((linea: string) => ({
                value: linea,
                label: linea,
              }))
            );
            if (formData.linea && !lineasData.data.includes(formData.linea)) {
              setFormData((prev) => ({ ...prev, linea: "" }));
            }
          }
        }
      } catch (error) {
        console.error("Error cargando líneas:", error);
        setLineas([]);
      }
    };

    loadLineas();
  }, [formData.category, formData.marca, formData.aroma, formData.linea]); // Agregar formData.linea como dependencia
  // Cargar opciones de tamaño, color, tipo y piedra según la categoría
  useEffect(() => {
    const cargarOpcionesEspeciales = () => {
      if (!formData.category) return;

      const cat = formData.category.toLowerCase();
      const nuevosTamaños: TamañoOption[] = [];
      const nuevosColores: ColorOption[] = [];
      const nuevosTipos: TipoOption[] = [];
      const nuevasPiedras: PiedraOption[] = [];

      // Opciones de tamaño para velas
      if (cat.includes("vela")) {
        nuevosTamaños.push(
          { value: "chico", label: "Chico" },
          { value: "mediano", label: "Mediano" },
          { value: "grande", label: "Grande" }
        );
      }

      // Opciones de tamaño para otras categorías
      if (
        cat.includes("cascada de humo") ||
        cat.includes("estatua") ||
        cat.includes("porta sahumerios")
      ) {
        nuevosTamaños.push(
          { value: "pequeño", label: "Pequeño" },
          { value: "mediano", label: "Mediano" },
          { value: "grande", label: "Grande" },
          { value: "extra grande", label: "Extra Grande" }
        );
      }

      // ✨ NUEVO: Opciones de tamaño para cerámica
      if (cat.includes("ceramica") || cat.includes("cerámica")) {
        nuevosTamaños.push(
          { value: "pequeño", label: "Pequeño" },
          { value: "mediano", label: "Mediano" },
          { value: "grande", label: "Grande" },
          { value: "extra grande", label: "Extra Grande" }
        );
      }

      // Opciones de tamaño y color para lámparas de sal
      if (cat.includes("lampara de sal")) {
        nuevosTamaños.push(
          { value: "chica", label: "Chica (1-2 kg)" },
          { value: "mediana", label: "Mediana (3-5 kg)" },
          { value: "grande", label: "Grande (6-10 kg)" },
          { value: "extra grande", label: "Extra Grande (11+ kg)" }
        );

        nuevosColores.push(
          { value: "blanco", label: "Blanco" },
          { value: "rosa", label: "Rosa" },
          { value: "naranja", label: "Naranja" },
          { value: "multicolor", label: "Multicolor" }
        );
      }

      // ✨ NUEVO: Opciones de tipo para cerámica
      if (cat.includes("ceramica") || cat.includes("cerámica")) {
        nuevosTipos.push(
          { value: "porta sahumerios", label: "Porta Sahumerios" },
          { value: "porta velas", label: "Porta Velas" },
          { value: "hornillo", label: "Hornillo" },
          { value: "quemador de esencias", label: "Quemador de Esencias" },
          {
            value: "cascada de humo ceramica",
            label: "Cascada de Humo Cerámica",
          },
          { value: "difusor", label: "Difusor" },
          { value: "otros", label: "Otros" }
        );
      }

      // Opciones de tipo para accesorios
      if (cat.includes("accesorios")) {
        nuevosTipos.push(
          { value: "collar", label: "Collar" },
          { value: "pulsera", label: "Pulsera" },
          { value: "anillo", label: "Anillo" },
          { value: "aretes", label: "Aretes" },
          { value: "otros", label: "Otros" }
        );

        // Opciones de piedras (siempre disponibles para accesorios, pero solo requeridas para collares)
        nuevasPiedras.push(
          { value: "cuarzo", label: "Cuarzo" },
          { value: "amatista", label: "Amatista" },
          { value: "cuarzo rosa", label: "Cuarzo Rosa" },
          { value: "ojo de tigre", label: "Ojo de Tigre" },
          { value: "obsidiana", label: "Obsidiana" },
          { value: "hematita", label: "Hematita" },
          { value: "turmalina", label: "Turmalina" },
          { value: "labradorita", label: "Labradorita" },
          { value: "aventurina", label: "Aventurina" },
          { value: "sodalita", label: "Sodalita" },
          { value: "jaspe", label: "Jaspe" },
          { value: "citrino", label: "Citrino" },
          { value: "fluorita", label: "Fluorita" },
          { value: "pirita", label: "Pirita" },
          { value: "malaquita", label: "Malaquita" },
          { value: "sin piedra", label: "Sin Piedra" }
        );
      }

      setTamaños(nuevosTamaños);
      setColores(nuevosColores);
      setTipos(nuevosTipos);
      setPiedras(nuevasPiedras);
    };

    cargarOpcionesEspeciales();
  }, [formData.category]);

  // Limpiar piedra cuando cambia el tipo (si ya no es collar)
  useEffect(() => {
    if (
      formData.category.toLowerCase().includes("accesorios") &&
      formData.tipo &&
      !formData.tipo.toLowerCase().includes("collar") &&
      formData.piedra
    ) {
      setFormData((prev) => ({ ...prev, piedra: "" }));
    }
  }, [formData.tipo, formData.category, formData.piedra]); // Agregar formData.piedra como dependencia

  // Verificar si existe un producto similar cuando cambien los campos relevantes
  useEffect(() => {
    const verificarProductoExistente = async () => {
      if (!formData.category || !formData.name) {
        setProductoExistente(null);
        return;
      }

      const campos = getCamposRequeridos(formData.category);

      // Validar campos requeridos según la categoría
      if (campos.marca && !formData.marca) {
        setProductoExistente(null);
        return;
      }

      if (campos.aroma && !formData.aroma) {
        setProductoExistente(null);
        return;
      }

      if (campos.tamaño && !formData.tamaño) {
        setProductoExistente(null);
        return;
      }

      if (campos.color && !formData.color) {
        setProductoExistente(null);
        return;
      }

      if (campos.tipo && !formData.tipo) {
        setProductoExistente(null);
        return;
      }

      // Validar piedra solo si es collar
      if (
        requierePiedra(formData.category, formData.tipo || "") &&
        !formData.piedra
      ) {
        setProductoExistente(null);
        return;
      }

      try {
        let url = `/api/agregarProd?search=${encodeURIComponent(
          formData.name
        )}&category=${encodeURIComponent(formData.category)}`;

        if (campos.marca && formData.marca) {
          url += `&marca=${encodeURIComponent(formData.marca)}`;
        }

        if (campos.aroma && formData.aroma) {
          url += `&aroma=${encodeURIComponent(formData.aroma)}`;
        }

        if (campos.linea && formData.linea) {
          url += `&linea=${encodeURIComponent(formData.linea)}`;
        }

        if (campos.tamaño && formData.tamaño) {
          url += `&tamaño=${encodeURIComponent(formData.tamaño)}`;
        }

        if (campos.color && formData.color) {
          url += `&color=${encodeURIComponent(formData.color)}`;
        }

        if (campos.tipo && formData.tipo) {
          url += `&tipo=${encodeURIComponent(formData.tipo)}`;
        }

        if (formData.piedra) {
          url += `&piedra=${encodeURIComponent(formData.piedra)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data.length > 0) {
            const productoSimilar = data.data.find((p: ProductoExistente) => {
              const mismoNombre =
                p.name.toLowerCase() === formData.name.toLowerCase();
              const mismaCategoria =
                p.category.toLowerCase() === formData.category.toLowerCase();

              let camposCoinciden = true;

              if (campos.marca) {
                camposCoinciden =
                  camposCoinciden &&
                  p.marca?.toLowerCase() === formData.marca.toLowerCase();
              }

              if (campos.aroma) {
                camposCoinciden =
                  camposCoinciden &&
                  p.aroma?.toLowerCase() === formData.aroma.toLowerCase();
              }

              if (campos.linea) {
                camposCoinciden =
                  camposCoinciden &&
                  (p.linea || "").toLowerCase() ===
                    (formData.linea || "").toLowerCase();
              }

              if (campos.tamaño) {
                camposCoinciden =
                  camposCoinciden &&
                  (p.tamaño || "").toLowerCase() ===
                    (formData.tamaño || "").toLowerCase();
              }

              if (campos.color) {
                camposCoinciden =
                  camposCoinciden &&
                  (p.color || "").toLowerCase() ===
                    (formData.color || "").toLowerCase();
              }

              if (campos.tipo) {
                camposCoinciden =
                  camposCoinciden &&
                  (p.tipo || "").toLowerCase() ===
                    (formData.tipo || "").toLowerCase();
              }

              // Verificar piedra si existe
              if (formData.piedra) {
                camposCoinciden =
                  camposCoinciden &&
                  (p.piedra || "").toLowerCase() ===
                    (formData.piedra || "").toLowerCase();
              }

              return mismoNombre && mismaCategoria && camposCoinciden;
            });

            setProductoExistente(productoSimilar || null);
          } else {
            setProductoExistente(null);
          }
        }
      } catch (error) {
        console.error("Error verificando producto existente:", error);
        setProductoExistente(null);
      }
    };

    verificarProductoExistente();
  }, [
    formData.name,
    formData.category,
    formData.marca,
    formData.aroma,
    formData.linea,
    formData.tamaño,
    formData.color,
    formData.tipo,
    formData.piedra,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Limpiar mensaje de éxito
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "add-new") {
      setShowNewCategoryInput(true);
      setFormData((prev) => ({
        ...prev,
        category: "",
        marca: "",
        aroma: "",
        linea: "",
        tamaño: "",
        color: "",
        tipo: "",
        piedra: "",
      }));
      setMarcas([]);
      setAromas([]);
      setLineas([]);
      setTamaños([]);
      setColores([]);
      setTipos([]);
      setPiedras([]);
    } else {
      setFormData((prev) => ({
        ...prev,
        category: value,
        marca: "",
        aroma: "",
        linea: "",
        tamaño: "",
        color: "",
        tipo: "",
        piedra: "",
      }));
      setShowNewCategoryInput(false);

      // Limpiar errores
      const errorFields = [
        "category",
        "marca",
        "aroma",
        "linea",
        "tamaño",
        "color",
        "tipo",
        "piedra",
      ];
      errorFields.forEach((field) => {
        if (errors[field as keyof FormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      });
    }
  };

  const handleMarcaChange = (value: string) => {
    if (value === "add-new") {
      setShowNewMarcaInput(true);
      setFormData((prev) => ({ ...prev, marca: "", aroma: "", linea: "" }));
    } else {
      setFormData((prev) => ({ ...prev, marca: value, aroma: "", linea: "" }));
      setShowNewMarcaInput(false);
      if (errors.marca) {
        setErrors((prev) => ({ ...prev, marca: undefined }));
      }
      if (errors.aroma) {
        setErrors((prev) => ({ ...prev, aroma: undefined }));
      }
      if (errors.linea) {
        setErrors((prev) => ({ ...prev, linea: undefined }));
      }
    }
  };

  const handleAromaChange = (value: string) => {
    if (value === "add-new") {
      setShowNewAromaInput(true);
      setFormData((prev) => ({ ...prev, aroma: "", linea: "" }));
    } else {
      setFormData((prev) => ({ ...prev, aroma: value }));
      setShowNewAromaInput(false);
      if (errors.aroma) {
        setErrors((prev) => ({ ...prev, aroma: undefined }));
      }
      if (errors.linea) {
        setErrors((prev) => ({ ...prev, linea: undefined }));
      }
    }
  };

  const handleLineaChange = (value: string) => {
    if (value === "add-new") {
      setShowNewLineaInput(true);
      setFormData((prev) => ({ ...prev, linea: "" }));
    } else {
      setFormData((prev) => ({ ...prev, linea: value }));
      setShowNewLineaInput(false);
      if (errors.linea) {
        setErrors((prev) => ({ ...prev, linea: undefined }));
      }
    }
  };

  const handleTamañoChange = (value: string) => {
    if (value === "add-new") {
      setShowNewTamañoInput(true);
      setFormData((prev) => ({ ...prev, tamaño: "" }));
    } else {
      setFormData((prev) => ({ ...prev, tamaño: value }));
      setShowNewTamañoInput(false);
      if (errors.tamaño) {
        setErrors((prev) => ({ ...prev, tamaño: undefined }));
      }
    }
  };

  const handleColorChange = (value: string) => {
    if (value === "add-new") {
      setShowNewColorInput(true);
      setFormData((prev) => ({ ...prev, color: "" }));
    } else {
      setFormData((prev) => ({ ...prev, color: value }));
      setShowNewColorInput(false);
      if (errors.color) {
        setErrors((prev) => ({ ...prev, color: undefined }));
      }
    }
  };

  const handleTipoChange = (value: string) => {
    if (value === "add-new") {
      setShowNewTipoInput(true);
      setFormData((prev) => ({ ...prev, tipo: "" }));
    } else {
      setFormData((prev) => ({ ...prev, tipo: value }));
      setShowNewTipoInput(false);
      if (errors.tipo) {
        setErrors((prev) => ({ ...prev, tipo: undefined }));
      }
    }
  };

  const handlePiedraChange = (value: string) => {
    if (value === "add-new") {
      setShowNewPiedraInput(true);
      setFormData((prev) => ({ ...prev, piedra: "" }));
    } else {
      setFormData((prev) => ({ ...prev, piedra: value }));
      setShowNewPiedraInput(false);
      if (errors.piedra) {
        setErrors((prev) => ({ ...prev, piedra: undefined }));
      }
    }
  };

  const handleAddNewCategory = async () => {
    if (newCategoryValue.trim()) {
      const newCategory = {
        value: newCategoryValue.trim(),
        label: newCategoryValue.trim(),
      };
      setCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({ ...prev, category: newCategoryValue.trim() }));
      setNewCategoryValue("");
      setShowNewCategoryInput(false);
      if (errors.category) {
        setErrors((prev) => ({ ...prev, category: undefined }));
      }
      console.log(
        `✅ Nueva categoría añadida localmente: "${newCategoryValue.trim()}"`
      );
    }
  };

  const handleAddNewMarca = async () => {
    if (newMarcaValue.trim() && formData.category) {
      try {
        const response = await fetch(
          `/api/agregarProd?saveMarca=true&category=${encodeURIComponent(
            formData.category
          )}&marca=${encodeURIComponent(newMarcaValue.trim())}`
        );

        if (response.ok) {
          const newMarca = {
            value: newMarcaValue.trim(),
            label: newMarcaValue.trim(),
          };
          setMarcas((prev) => [...prev, newMarca]);
          setFormData((prev) => ({ ...prev, marca: newMarcaValue.trim() }));
          setNewMarcaValue("");
          setShowNewMarcaInput(false);
          if (errors.marca) {
            setErrors((prev) => ({ ...prev, marca: undefined }));
          }
          console.log(
            `✅ Marca "${newMarcaValue.trim()}" guardada en categoría "${
              formData.category
            }"`
          );
        } else {
          console.error("Error al guardar la marca");
          const newMarca = {
            value: newMarcaValue.trim(),
            label: newMarcaValue.trim(),
          };
          setMarcas((prev) => [...prev, newMarca]);
          setFormData((prev) => ({ ...prev, marca: newMarcaValue.trim() }));
          setNewMarcaValue("");
          setShowNewMarcaInput(false);
        }
      } catch (error) {
        console.error("Error al guardar marca:", error);
        const newMarca = {
          value: newMarcaValue.trim(),
          label: newMarcaValue.trim(),
        };
        setMarcas((prev) => [...prev, newMarca]);
        setFormData((prev) => ({ ...prev, marca: newMarcaValue.trim() }));
        setNewMarcaValue("");
        setShowNewMarcaInput(false);
      }
    }
  };

  const handleAddNewAroma = async () => {
    if (newAromaValue.trim() && formData.category && formData.marca) {
      try {
        const response = await fetch(
          `/api/agregarProd?saveAroma=true&category=${encodeURIComponent(
            formData.category
          )}&marca=${encodeURIComponent(
            formData.marca
          )}&aroma=${encodeURIComponent(newAromaValue.trim())}`
        );

        if (response.ok) {
          const newAroma = {
            value: newAromaValue.trim(),
            label: newAromaValue.trim(),
          };
          setAromas((prev) => [...prev, newAroma]);
          setFormData((prev) => ({ ...prev, aroma: newAromaValue.trim() }));
          setNewAromaValue("");
          setShowNewAromaInput(false);
          if (errors.aroma) {
            setErrors((prev) => ({ ...prev, aroma: undefined }));
          }
          console.log(
            `✅ Aroma "${newAromaValue.trim()}" guardado para marca "${
              formData.marca
            }" en categoría "${formData.category}"`
          );
        } else {
          console.error("Error al guardar el aroma");
          const newAroma = {
            value: newAromaValue.trim(),
            label: newAromaValue.trim(),
          };
          setAromas((prev) => [...prev, newAroma]);
          setFormData((prev) => ({ ...prev, aroma: newAromaValue.trim() }));
          setNewAromaValue("");
          setShowNewAromaInput(false);
        }
      } catch (error) {
        console.error("Error al guardar aroma:", error);
        const newAroma = {
          value: newAromaValue.trim(),
          label: newAromaValue.trim(),
        };
        setAromas((prev) => [...prev, newAroma]);
        setFormData((prev) => ({ ...prev, aroma: newAromaValue.trim() }));
        setNewAromaValue("");
        setShowNewAromaInput(false);
      }
    }
  };

  const handleAddNewLinea = async () => {
    if (newLineaValue.trim() && formData.category && formData.marca) {
      try {
        const response = await fetch(
          `/api/agregarProd?saveLinea=true&category=${encodeURIComponent(
            formData.category
          )}&marca=${encodeURIComponent(
            formData.marca
          )}&aroma=${encodeURIComponent(
            formData.aroma || ""
          )}&linea=${encodeURIComponent(newLineaValue.trim())}`
        );

        if (response.ok) {
          const newLinea = {
            value: newLineaValue.trim(),
            label: newLineaValue.trim(),
          };
          setLineas((prev) => [...prev, newLinea]);
          setFormData((prev) => ({ ...prev, linea: newLineaValue.trim() }));
          setNewLineaValue("");
          setShowNewLineaInput(false);
          if (errors.linea) {
            setErrors((prev) => ({ ...prev, linea: undefined }));
          }
          console.log(
            `✅ Línea "${newLineaValue.trim()}" guardada para marca "${
              formData.marca
            }" en categoría "${formData.category}"`
          );
        } else {
          console.error("Error al guardar la línea");
          const newLinea = {
            value: newLineaValue.trim(),
            label: newLineaValue.trim(),
          };
          setLineas((prev) => [...prev, newLinea]);
          setFormData((prev) => ({ ...prev, linea: newLineaValue.trim() }));
          setNewLineaValue("");
          setShowNewLineaInput(false);
        }
      } catch (error) {
        console.error("Error al guardar línea:", error);
        const newLinea = {
          value: newLineaValue.trim(),
          label: newLineaValue.trim(),
        };
        setLineas((prev) => [...prev, newLinea]);
        setFormData((prev) => ({ ...prev, linea: newLineaValue.trim() }));
        setNewLineaValue("");
        setShowNewLineaInput(false);
      }
    }
  };

  const handleAddNewTamaño = async () => {
    if (newTamañoValue.trim()) {
      const newTamaño = {
        value: newTamañoValue.trim(),
        label: newTamañoValue.trim(),
      };
      setTamaños((prev) => [...prev, newTamaño]);
      setFormData((prev) => ({ ...prev, tamaño: newTamañoValue.trim() }));
      setNewTamañoValue("");
      setShowNewTamañoInput(false);
      if (errors.tamaño) {
        setErrors((prev) => ({ ...prev, tamaño: undefined }));
      }
    }
  };

  const handleAddNewColor = async () => {
    if (newColorValue.trim()) {
      const newColor = {
        value: newColorValue.trim(),
        label: newColorValue.trim(),
      };
      setColores((prev) => [...prev, newColor]);
      setFormData((prev) => ({ ...prev, color: newColorValue.trim() }));
      setNewColorValue("");
      setShowNewColorInput(false);
      if (errors.color) {
        setErrors((prev) => ({ ...prev, color: undefined }));
      }
    }
  };

  const handleAddNewTipo = async () => {
    if (newTipoValue.trim()) {
      const newTipo = {
        value: newTipoValue.trim(),
        label: newTipoValue.trim(),
      };
      setTipos((prev) => [...prev, newTipo]);
      setFormData((prev) => ({ ...prev, tipo: newTipoValue.trim() }));
      setNewTipoValue("");
      setShowNewTipoInput(false);
      if (errors.tipo) {
        setErrors((prev) => ({ ...prev, tipo: undefined }));
      }
    }
  };

  const handleAddNewPiedra = async () => {
    if (newPiedraValue.trim()) {
      const newPiedra = {
        value: newPiedraValue.trim(),
        label: newPiedraValue.trim(),
      };
      setPiedras((prev) => [...prev, newPiedra]);
      setFormData((prev) => ({ ...prev, piedra: newPiedraValue.trim() }));
      setNewPiedraValue("");
      setShowNewPiedraInput(false);
      if (errors.piedra) {
        setErrors((prev) => ({ ...prev, piedra: undefined }));
      }
    }
  };

  const handleCancelNewCategory = () => {
    setShowNewCategoryInput(false);
    setNewCategoryValue("");
  };

  const handleCancelNewMarca = () => {
    setShowNewMarcaInput(false);
    setNewMarcaValue("");
  };

  const handleCancelNewAroma = () => {
    setShowNewAromaInput(false);
    setNewAromaValue("");
  };

  const handleCancelNewLinea = () => {
    setShowNewLineaInput(false);
    setNewLineaValue("");
  };

  const handleCancelNewTamaño = () => {
    setShowNewTamañoInput(false);
    setNewTamañoValue("");
  };

  const handleCancelNewColor = () => {
    setShowNewColorInput(false);
    setNewColorValue("");
  };

  const handleCancelNewTipo = () => {
    setShowNewTipoInput(false);
    setNewTipoValue("");
  };

  const handleCancelNewPiedra = () => {
    setShowNewPiedraInput(false);
    setNewPiedraValue("");
  };

  const handleSingleImageMode = () => {
    setUploadMode("single");
    setFormData((prev) => ({ ...prev, images: [] }));
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const handleMultipleImageMode = () => {
    setUploadMode("multiple");
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const handleImageUpload = (result: { publicId: string; url: string }) => {
    if (!result.url) return;

    const newImage: UploadedImage = {
      publicId: result.publicId,
      url: result.url,
    };

    if (uploadMode === "single") {
      setFormData((prev) => ({
        ...prev,
        images: [newImage],
      }));
    } else if (uploadMode === "multiple") {
      setFormData((prev) => {
        if (prev.images.length >= 5) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            images: "Máximo 5 imágenes permitidas",
          }));
          return prev;
        }

        return {
          ...prev,
          images: [...prev.images, newImage],
        };
      });
    }

    if (errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: undefined,
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const campos = getCamposRequeridos(formData.category);

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es requerido";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    // Validar precio
    if (!formData.price.trim()) {
      newErrors.price = "El precio es requerido";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = "Ingresa un precio válido (ej: 25.99)";
    }

    // Validar categoría
    if (!formData.category) {
      newErrors.category = "Selecciona o agrega una categoría";
    }

    // Validar marca solo si la categoría requiere marca
    if (campos.marca) {
      if (!formData.marca) {
        newErrors.marca = "La marca es requerida";
      } else if (formData.marca.trim().length < 2) {
        newErrors.marca = "La marca debe tener al menos 2 caracteres";
      }
    }

    // Validar aroma solo si la categoría requiere aroma
    if (campos.aroma) {
      if (!formData.aroma) {
        newErrors.aroma = `El aroma es requerido para productos de categoría ${formData.category}`;
      } else if (formData.aroma.trim().length < 2) {
        newErrors.aroma = "El aroma debe tener al menos 2 caracteres";
      }
    }

    // Validar línea solo si la categoría permite línea
    if (campos.linea && formData.linea && formData.linea.trim().length < 2) {
      newErrors.linea = "La línea debe tener al menos 2 caracteres";
    }

    // Validar tamaño solo si la categoría requiere tamaño
    if (campos.tamaño) {
      if (!formData.tamaño) {
        newErrors.tamaño = `El tamaño es requerido para productos de categoría ${formData.category}`;
      }
    }

    // Validar color solo si la categoría requiere color
    if (campos.color) {
      if (!formData.color) {
        newErrors.color = `El color es requerido para productos de categoría ${formData.category}`;
      }
    }

    // Validar tipo solo si la categoría requiere tipo
    if (campos.tipo) {
      if (!formData.tipo) {
        newErrors.tipo = `El tipo es requerido para productos de categoría ${formData.category}`;
      }
    }

    // Validar cantidad solo si la categoría requiere cantidad (velas)
    if (campos.cantidad) {
      if (!formData.cantidad.trim()) {
        newErrors.cantidad = `La cantidad por pack es requerida para productos de categoría ${formData.category}`;
      } else if (!/^\d+$/.test(formData.cantidad)) {
        newErrors.cantidad = "La cantidad por pack debe ser un número entero";
      } else if (parseInt(formData.cantidad) <= 0) {
        newErrors.cantidad = "La cantidad por pack debe ser mayor a 0";
      }
    }

    // Validar piedra solo si es collar en accesorios
    if (requierePiedra(formData.category, formData.tipo || "")) {
      if (!formData.piedra) {
        newErrors.piedra = "El tipo de piedra es requerido para collares";
      }
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (formData.description.trim().length < 10) {
      newErrors.description =
        "La descripción debe tener al menos 10 caracteres";
    }

    // Validar stock a agregar
    if (!formData.cantidad.trim()) {
      newErrors.cantidad = "La cantidad a agregar es requerida";
    } else if (!/^\d+$/.test(formData.cantidad)) {
      newErrors.cantidad = "La cantidad a agregar debe ser un número entero";
    } else if (parseInt(formData.cantidad) <= 0) {
      newErrors.cantidad = "La cantidad a agregar debe ser mayor a 0";
    }

    // Validar imágenes
    if (formData.images.length === 0) {
      newErrors.images = "Se requiere al menos una imagen del producto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // ✅ Mostrar toast de error de validación
      if (Object.keys(errors).length > 0) {
        toast.error("Error en el formulario", {
          description: "Por favor, corrige los errores marcados",
          duration: 5000,
        });
      }
      return;
    }

    setIsLoading(true);
    setErrors({});

    // ✅ Mostrar toast de carga
    const loadingToast = toast.loading(
      productoExistente ? "Incrementando stock..." : "Creando producto..."
    );

    try {
      const response = await fetch("/api/agregarProd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.name,
          precio: formData.price,
          descripcion: formData.description,
          imgUrl: formData.images[0]?.url || "",
          imgPublicId: formData.images[0]?.publicId || "",
          category: formData.category,
          marca: formData.marca,
          aroma: formData.aroma,
          linea: formData.linea,
          tamaño: formData.tamaño,
          color: formData.color,
          tipo: formData.tipo,
          piedra: formData.piedra,
          cantidad: formData.cantidad,
          shipping: "Envío Gratis",
          allImages: formData.images,
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error(
          "La respuesta del servidor no es válida. Verifica que la API esté funcionando correctamente."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al crear el producto");
      }

      // ✅ Cerrar toast de carga y mostrar éxito
      toast.dismiss(loadingToast);

      if (productoExistente) {
        // ✅ Mostrar toast de éxito para stock incrementado
        toast.success("¡Stock incrementado exitosamente!", {
          description: `Se agregaron ${
            formData.cantidad
          } unidades al producto existente. Stock total: ${
            data.data.stockNuevo || data.data.stock
          } unidades`,
          duration: 5000,
        });

        setSuccessMessage(
          `¡Stock incrementado exitosamente! Se agregaron ${
            formData.cantidad
          } unidades al producto existente. Stock total: ${
            data.data.stockNuevo || data.data.stock
          } unidades`
        );
      } else {
        // ✅ Mostrar toast de éxito para producto nuevo
        toast.success("¡Producto añadido correctamente!", {
          description: `Se creó un nuevo producto con ${formData.cantidad} unidades de stock inicial.`,
          duration: 5000,
        });

        setSuccessMessage(
          `¡Producto agregado exitosamente! Se creó un nuevo producto con ${formData.cantidad} unidades de stock inicial.`
        );
      }

      // Limpiar formulario después del éxito
      setTimeout(() => {
        setFormData({
          name: "",
          price: "",
          category: "",
          marca: "",
          aroma: "",
          linea: "",
          description: "",
          images: [],
          cantidad: "1",
        });
        setUploadMode(null);
        setSuccessMessage("");
        setProductoExistente(null);
      }, 3000);
    } catch (error) {
      // ✅ Cerrar toast de carga y mostrar error
      toast.dismiss(loadingToast);

      console.error("Error:", error);

      // ✅ Mostrar toast de error
      toast.error("Error al agregar producto", {
        description:
          error instanceof Error
            ? error.message
            : "Error al agregar el producto. Intenta nuevamente.",
        duration: 5000,
      });

      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Error al agregar el producto. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    window.location.href = "/productos";
  };

  // Obtener campos requeridos para la categoría actual
  const camposRequeridos = formData.category
    ? getCamposRequeridos(formData.category)
    : {
        marca: false,
        aroma: false,
        linea: false,
        tamaño: false,
        color: false,
        tipo: false,
        piedra: false,
        cantidad: false,
      };

  const mostrarPiedra = formData.category.toLowerCase().includes("accesorios");
  const piedraRequerida = requierePiedra(
    formData.category,
    formData.tipo || ""
  );
  const mostrarCantidad = camposRequeridos.cantidad;

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Productos</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-babalu-primary" />
            Información del Producto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Producto
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ej: Sahumerio de Lavanda Premium"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio (ARS)
              </label>
              <input
                id="price"
                name="price"
                type="text"
                value={formData.price}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                  errors.price ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="2500"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="cantidad"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Box className="w-4 h-4 inline mr-1" />
                Cantidad a Agregar
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                  errors.cantidad ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="1"
              />
              {errors.cantidad && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Esta cantidad se sumará al stock del producto existente o será
                el stock inicial si es un producto nuevo.
              </p>
            </div>

            {mostrarCantidad && (
              <div>
                <label
                  htmlFor="cantidadPack"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Box className="w-4 h-4 inline mr-1" />
                  Cantidad por Pack <span className="text-red-500">*</span>
                </label>
                <input
                  id="cantidadPack"
                  name="cantidad"
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                    errors.cantidad ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ej: 6 (para pack de 6 velas)"
                />
                {errors.cantidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Número de velas que vienen en cada pack.
                </p>
              </div>
            )}

            {productoExistente && (
              <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  ⚠️ Producto existente detectado
                </h4>
                <p className="text-xs text-blue-700">
                  Ya existe un producto con las mismas características. Al
                  guardar, se incrementará el stock del producto existente en{" "}
                  <span className="font-semibold">{formData.cantidad}</span>{" "}
                  unidades.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Stock actual:{" "}
                  <span className="font-semibold">
                    {productoExistente.stock}
                  </span>{" "}
                  unidades.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              {!showNewCategoryInput ? (
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={isLoadingOptions}
                >
                  <option value="">
                    {isLoadingOptions
                      ? "Cargando categorías..."
                      : "Selecciona una categoría"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                  <option value="add-new">➕ Agregar nueva categoría</option>
                </select>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryValue}
                    onChange={(e) => setNewCategoryValue(e.target.value)}
                    placeholder="Nueva categoría"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddNewCategory()
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewCategory}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelNewCategory}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {camposRequeridos.marca && (
              <div>
                <label
                  htmlFor="marca"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Marca <span className="text-red-500">*</span>
                </label>
                {!showNewMarcaInput ? (
                  <select
                    id="marca"
                    name="marca"
                    value={formData.marca}
                    onChange={(e) => handleMarcaChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.marca ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={!formData.category || isLoadingOptions}
                  >
                    <option value="">
                      {!formData.category
                        ? "Primero selecciona una categoría"
                        : marcas.length === 0
                        ? "No hay marcas para esta categoría"
                        : "Seleccionar marca"}
                    </option>
                    {marcas.map((marca) => (
                      <option key={marca.value} value={marca.value}>
                        {marca.label}
                      </option>
                    ))}
                    <option value="add-new">➕ Agregar nueva marca</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMarcaValue}
                      onChange={(e) => setNewMarcaValue(e.target.value)}
                      placeholder="Nueva marca"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewMarca()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewMarca}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewMarca}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.marca && (
                  <p className="mt-1 text-sm text-red-600">{errors.marca}</p>
                )}
              </div>
            )}

            {camposRequeridos.aroma && (
              <div>
                <label
                  htmlFor="aroma"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Flower2 className="w-4 h-4 inline mr-1" />
                  Aroma <span className="text-red-500">*</span>
                </label>
                {!showNewAromaInput ? (
                  <select
                    id="aroma"
                    name="aroma"
                    value={formData.aroma}
                    onChange={(e) => handleAromaChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.aroma ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={!formData.marca || isLoadingOptions}
                  >
                    <option value="">
                      {!formData.marca
                        ? "Primero selecciona una marca"
                        : aromas.length === 0
                        ? "No hay aromas para esta marca"
                        : "Seleccionar aroma"}
                    </option>
                    {aromas.map((aroma) => (
                      <option key={aroma.value} value={aroma.value}>
                        {aroma.label}
                      </option>
                    ))}
                    <option value="add-new">➕ Agregar nuevo aroma</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAromaValue}
                      onChange={(e) => setNewAromaValue(e.target.value)}
                      placeholder="Nuevo aroma (ej: Lavanda, Rosa, Sándalo)"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewAroma()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewAroma}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewAroma}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.aroma && (
                  <p className="mt-1 text-sm text-red-600">{errors.aroma}</p>
                )}
              </div>
            )}

            {camposRequeridos.linea && (
              <div>
                <label
                  htmlFor="linea"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Layers className="w-4 h-4 inline mr-1" />
                  Línea (Opcional)
                </label>
                {!showNewLineaInput ? (
                  <select
                    id="linea"
                    name="linea"
                    value={formData.linea}
                    onChange={(e) => handleLineaChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.linea ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={!formData.marca || isLoadingOptions}
                  >
                    <option value="">Seleccionar línea (opcional)</option>
                    {lineas.map((linea) => (
                      <option key={linea.value} value={linea.value}>
                        {linea.label}
                      </option>
                    ))}
                    <option value="add-new">➕ Agregar nueva línea</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newLineaValue}
                      onChange={(e) => setNewLineaValue(e.target.value)}
                      placeholder="Nueva línea (ej: Clásica, Premium, Especial)"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewLinea()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewLinea}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewLinea}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.linea && (
                  <p className="mt-1 text-sm text-red-600">{errors.linea}</p>
                )}
              </div>
            )}

            {camposRequeridos.tamaño && (
              <div>
                <label
                  htmlFor="tamaño"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Tamaño <span className="text-red-500">*</span>
                </label>
                {!showNewTamañoInput ? (
                  <select
                    id="tamaño"
                    name="tamaño"
                    value={formData.tamaño || ""}
                    onChange={(e) => handleTamañoChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.tamaño ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar tamaño</option>
                    {tamaños.map((tamaño) => (
                      <option key={tamaño.value} value={tamaño.value}>
                        {tamaño.label}
                      </option>
                    ))}
                    <option value="add-new">➕ Agregar nuevo tamaño</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTamañoValue}
                      onChange={(e) => setNewTamañoValue(e.target.value)}
                      placeholder="Nuevo tamaño"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewTamaño()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewTamaño}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewTamaño}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.tamaño && (
                  <p className="mt-1 text-sm text-red-600">{errors.tamaño}</p>
                )}
              </div>
            )}

            {camposRequeridos.color && (
              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Palette className="w-4 h-4 inline mr-1" />
                  Color <span className="text-red-500">*</span>
                </label>
                {!showNewColorInput ? (
                  <select
                    id="color"
                    name="color"
                    value={formData.color || ""}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.color ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar color</option>
                    {colores.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                    <option value="add-new">➕ Agregar nuevo color</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newColorValue}
                      onChange={(e) => setNewColorValue(e.target.value)}
                      placeholder="Nuevo color"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewColor()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewColor}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewColor}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                )}
              </div>
            )}

            {camposRequeridos.tipo && (
              <div>
                <label
                  htmlFor="tipo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tipo <span className="text-red-500">*</span>
                </label>
                {!showNewTipoInput ? (
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo || ""}
                    onChange={(e) => handleTipoChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.tipo ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tipos.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                    <option value="add-new">➕ Agregar nuevo tipo</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTipoValue}
                      onChange={(e) => setNewTipoValue(e.target.value)}
                      placeholder="Nuevo tipo"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewTipo()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewTipo}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewTipo}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                )}
              </div>
            )}

            {mostrarPiedra && (
              <div>
                <label
                  htmlFor="piedra"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Gem className="w-4 h-4 inline mr-1" />
                  Tipo de Piedra{" "}
                  {piedraRequerida && <span className="text-red-500">*</span>}
                  {!piedraRequerida && (
                    <span className="text-gray-500">(Opcional)</span>
                  )}
                </label>
                {!showNewPiedraInput ? (
                  <select
                    id="piedra"
                    name="piedra"
                    value={formData.piedra || ""}
                    onChange={(e) => handlePiedraChange(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                      errors.piedra ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {piedraRequerida
                        ? "Seleccionar tipo de piedra"
                        : "Seleccionar tipo de piedra (opcional)"}
                    </option>
                    {piedras.map((piedra) => (
                      <option key={piedra.value} value={piedra.value}>
                        {piedra.label}
                      </option>
                    ))}
                    <option value="add-new">
                      ➕ Agregar nuevo tipo de piedra
                    </option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPiedraValue}
                      onChange={(e) => setNewPiedraValue(e.target.value)}
                      placeholder="Nueva piedra (ej: Onix, Jade, etc.)"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewPiedra()
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewPiedra}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelNewPiedra}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.piedra && (
                  <p className="mt-1 text-sm text-red-600">{errors.piedra}</p>
                )}
                {piedraRequerida && (
                  <p className="mt-1 text-xs text-blue-600">
                    El tipo de piedra es requerido para collares
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-babalu-primary" />
            Descripción
          </h3>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descripción del Producto
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary resize-none ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe las características, beneficios y usos del producto..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-babalu-primary" />
            Imágenes del Producto
          </h3>

          <div className="space-y-4">
            {!uploadMode && (
              <>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSingleImageMode}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-transparent"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Seleccionar una imagen</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMultipleImageMode}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-transparent"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Seleccionar múltiples imágenes</span>
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  <p>• Máximo 5 imágenes</p>
                  <p>• Formatos soportados: JPG, PNG, GIF, WebP</p>
                </div>
              </>
            )}

            {uploadMode === "single" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Imagen principal del producto
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadMode(null);
                      setFormData((prev) => ({ ...prev, images: [] }));
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cambiar modo
                  </Button>
                </div>
                <ImageUploader
                  label="Subir imagen"
                  onUpload={handleImageUpload}
                  maxImages={1}
                />
              </div>
            )}

            {uploadMode === "multiple" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Galería de imágenes ({formData.images.length}/5)
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadMode(null);
                      setFormData((prev) => ({ ...prev, images: [] }));
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cambiar modo
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square border border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={image.url}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={300}
                          height={300}
                          priority={index === 0}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 5 && (
                    <ImageUploader
                      label="Agregar imagen"
                      onUpload={handleImageUpload}
                      maxImages={1}
                    />
                  )}
                </div>
              </div>
            )}

            {errors.images && (
              <p className="text-sm text-red-600">{errors.images}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            className="px-6 py-3 bg-transparent"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-babalu-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {productoExistente ? "Incrementar Stock" : "Agregar Producto"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
