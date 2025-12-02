"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { useRouter, useParams } from "next/navigation";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import Link from "next/link";
import S3Image from "@/app/components/S3Image";

// Configure Amplify for client-side auth
Amplify.configure(outputs, { ssr: true });

const client = generateClient<Schema>();

export default function AdminProductsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [userEmail, setUserEmail] = useState<string>("");
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "products">("categories");

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [newCategory, setNewCategory] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    sortOrder: 0,
    isActive: true,
    imageUrl: "",
  });

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>("");
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    price: 0,
    categoryId: "",
    images: [] as string[],
    isAvailable: true,
    preparationTimeMinutes: 15,
  });
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && userGroups.includes("Admin")) {
      loadCategories();
      loadProducts();
    }
  }, [loading, userGroups]);

  async function checkAuth() {
    try {
      const session = await fetchAuthSession();
      
      if (!session.tokens) {
        router.push(`/${locale}/admin/login`);
        return;
      }

      // Get user email and groups from JWT token
      const idToken = session.tokens.idToken;
      if (idToken) {
        const payload = idToken.payload;
        const email = payload.email as string || "";
        const groups = (payload["cognito:groups"] as string[]) || [];
        
        setUserEmail(email);
        setUserGroups(groups);

        // Check if user has Admin role
        if (!groups.includes("Admin")) {
          router.push(`/${locale}/admin/dashboard`);
          return;
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      router.push(`/${locale}/admin/login`);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push(`/${locale}/admin/login`);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  async function loadCategories() {
    try {
      const { data, errors } = await client.models.Category.list();
      if (errors) {
        console.error("Error loading categories:", errors);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadProducts() {
    try {
      const { data, errors } = await client.models.Product.list();
      if (errors) {
        console.error("Error loading products:", errors);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  // Upload image to S3
  async function uploadImageToS3(file: File, path: string): Promise<string> {
    try {
      const result = await uploadData({
        path: `public/${path}/${Date.now()}-${file.name}`,
        data: file,
        options: {
          contentType: file.type,
        }
      }).result;

      // Return the path, not the full URL
      // We'll use getUrl when displaying images
      return result.path;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }

  // Handle category image selection
  function handleCategoryImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle product image selection
  function handleProductImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProductImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      let imageUrl = newCategory.imageUrl;

      // Upload image if file selected
      if (categoryImageFile) {
        setUploadingCategoryImage(true);
        imageUrl = await uploadImageToS3(categoryImageFile, "categories");
        setUploadingCategoryImage(false);
      }

      const { data, errors } = await client.models.Category.create({
        ...newCategory,
        imageUrl: imageUrl || undefined,
      });

      if (errors) {
        console.error("Error creating category:", errors);
        alert("Failed to create category");
      } else {
        alert("Category created successfully!");
        setShowCategoryForm(false);
        resetCategoryForm();
        loadCategories();
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
      setUploadingCategoryImage(false);
    }
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      let imageUrl = editingCategory.imageUrl;

      // Upload new image if file selected
      if (categoryImageFile) {
        setUploadingCategoryImage(true);
        imageUrl = await uploadImageToS3(categoryImageFile, "categories");
        setUploadingCategoryImage(false);
      }

      const { data, errors } = await client.models.Category.update({
        id: editingCategory.id,
        nameEn: editingCategory.nameEn,
        nameAr: editingCategory.nameAr,
        descriptionEn: editingCategory.descriptionEn,
        descriptionAr: editingCategory.descriptionAr,
        sortOrder: editingCategory.sortOrder,
        isActive: editingCategory.isActive,
        imageUrl: imageUrl || undefined,
      });

      if (errors) {
        console.error("Error updating category:", errors);
        alert("Failed to update category");
      } else {
        alert("Category updated successfully!");
        setEditingCategory(null);
        resetCategoryForm();
        loadCategories();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
      setUploadingCategoryImage(false);
    }
  }

  function resetCategoryForm() {
    setNewCategory({
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      sortOrder: 0,
      isActive: true,
      imageUrl: "",
    });
    setCategoryImageFile(null);
    setCategoryImagePreview("");
    setEditingCategory(null);
  }

  function startEditCategory(category: any) {
    setEditingCategory(category);
    setShowCategoryForm(true);
    if (category.imageUrl) {
      setCategoryImagePreview(category.imageUrl);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      let images: string[] = [];

      // Upload image if file selected
      if (productImageFile) {
        setUploadingProductImage(true);
        const imageUrl = await uploadImageToS3(productImageFile, "products");
        images = [imageUrl];
        setUploadingProductImage(false);
      } else if (imageUrlInput) {
        // Fallback to URL input
        images = [imageUrlInput];
      }

      const { data, errors } = await client.models.Product.create({
        ...newProduct,
        images,
        type: "MEAL" as any,
      });

      if (errors) {
        console.error("Error creating product:", errors);
        alert("Failed to create product");
      } else {
        alert("Product created successfully!");
        setShowProductForm(false);
        resetProductForm();
        loadProducts();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
      setUploadingProductImage(false);
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let images = editingProduct.images || [];

      // Upload new image if file selected
      if (productImageFile) {
        setUploadingProductImage(true);
        const imageUrl = await uploadImageToS3(productImageFile, "products");
        images = [imageUrl];
        setUploadingProductImage(false);
      }

      const { data, errors } = await client.models.Product.update({
        id: editingProduct.id,
        nameEn: editingProduct.nameEn,
        nameAr: editingProduct.nameAr,
        descriptionEn: editingProduct.descriptionEn,
        descriptionAr: editingProduct.descriptionAr,
        price: editingProduct.price,
        categoryId: editingProduct.categoryId,
        images,
        isAvailable: editingProduct.isAvailable,
        preparationTimeMinutes: editingProduct.preparationTimeMinutes,
      });

      if (errors) {
        console.error("Error updating product:", errors);
        alert("Failed to update product");
      } else {
        alert("Product updated successfully!");
        setEditingProduct(null);
        resetProductForm();
        loadProducts();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
      setUploadingProductImage(false);
    }
  }

  function resetProductForm() {
    setNewProduct({
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      price: 0,
      categoryId: "",
      images: [],
      isAvailable: true,
      preparationTimeMinutes: 15,
    });
    setImageUrlInput("");
    setProductImageFile(null);
    setProductImagePreview("");
    setEditingProduct(null);
  }

  function startEditProduct(product: any) {
    setEditingProduct(product);
    setShowProductForm(true);
    if (product.images && product.images.length > 0) {
      setProductImagePreview(product.images[0]);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const { errors } = await client.models.Category.delete({ id });
      if (errors) {
        console.error("Error deleting category:", errors);
        alert("Failed to delete category");
      } else {
        alert("Category deleted successfully!");
        loadCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const { errors } = await client.models.Product.delete({ id });
      if (errors) {
        console.error("Error deleting product:", errors);
        alert("Failed to delete product");
      } else {
        alert("Product deleted successfully!");
        loadProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/admin/dashboard`}>
              <button className="text-gray-600 hover:text-gray-900">
                ← Back
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "categories"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "products"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Products ({products.length})
            </button>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add Category Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryForm(!showCategoryForm);
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
              >
                {showCategoryForm ? "Cancel" : "+ Add Category"}
              </button>
            </div>

            {/* Category Form */}
            {showCategoryForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
                <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name (English)
                      </label>
                      <input
                        type="text"
                        value={editingCategory ? editingCategory.nameEn : newCategory.nameEn}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, nameEn: e.target.value })
                          : setNewCategory({ ...newCategory, nameEn: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name (Arabic)
                      </label>
                      <input
                        type="text"
                        value={editingCategory ? editingCategory.nameAr : newCategory.nameAr}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, nameAr: e.target.value })
                          : setNewCategory({ ...newCategory, nameAr: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (English)
                      </label>
                      <textarea
                        value={editingCategory ? editingCategory.descriptionEn : newCategory.descriptionEn}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, descriptionEn: e.target.value })
                          : setNewCategory({ ...newCategory, descriptionEn: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Arabic)
                      </label>
                      <textarea
                        value={editingCategory ? editingCategory.descriptionAr : newCategory.descriptionAr}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, descriptionAr: e.target.value })
                          : setNewCategory({ ...newCategory, descriptionAr: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image
                    </label>
                    {categoryImagePreview && (
                      <div className="mb-3">
                        <img 
                          src={categoryImagePreview} 
                          alt="Preview" 
                          className="h-32 w-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload image or leave empty to skip
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={editingCategory ? editingCategory.sortOrder : newCategory.sortOrder}
                        onChange={(e) => editingCategory 
                          ? setEditingCategory({ ...editingCategory, sortOrder: parseInt(e.target.value) })
                          : setNewCategory({ ...newCategory, sortOrder: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingCategory ? editingCategory.isActive : newCategory.isActive}
                          onChange={(e) => editingCategory 
                            ? setEditingCategory({ ...editingCategory, isActive: e.target.checked })
                            : setNewCategory({ ...newCategory, isActive: e.target.checked })
                          }
                          className="w-5 h-5 text-orange-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        resetCategoryForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingCategoryImage}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {uploadingCategoryImage ? "Uploading..." : editingCategory ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  No categories yet. Create your first category to get started!
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {category.imageUrl && (
                      <div className="h-32 bg-gray-200">
                        <S3Image
                          path={category.imageUrl}
                          alt={category.nameEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{category.nameEn}</h3>
                          <p className="text-sm text-gray-600">{category.nameAr}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {category.descriptionEn && (
                        <p className="text-sm text-gray-600 mb-4">{category.descriptionEn}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Filters and Add Button */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 max-w-xs">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(!showProductForm);
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
              >
                {showProductForm ? "Cancel" : "+ Add Product"}
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h2>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name (English) *
                      </label>
                      <input
                        type="text"
                        value={editingProduct ? editingProduct.nameEn : newProduct.nameEn}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, nameEn: e.target.value })
                          : setNewProduct({ ...newProduct, nameEn: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name (Arabic) *
                      </label>
                      <input
                        type="text"
                        value={editingProduct ? editingProduct.nameAr : newProduct.nameAr}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, nameAr: e.target.value })
                          : setNewProduct({ ...newProduct, nameAr: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (English)
                      </label>
                      <textarea
                        value={editingProduct ? editingProduct.descriptionEn : newProduct.descriptionEn}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })
                          : setNewProduct({ ...newProduct, descriptionEn: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Arabic)
                      </label>
                      <textarea
                        value={editingProduct ? editingProduct.descriptionAr : newProduct.descriptionAr}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })
                          : setNewProduct({ ...newProduct, descriptionAr: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (KWD) *
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={editingProduct ? editingProduct.price : newProduct.price}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                          : setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={editingProduct ? editingProduct.categoryId : newProduct.categoryId}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                          : setNewProduct({ ...newProduct, categoryId: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Time (min)
                      </label>
                      <input
                        type="number"
                        value={editingProduct ? editingProduct.preparationTimeMinutes : newProduct.preparationTimeMinutes}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, preparationTimeMinutes: parseInt(e.target.value) })
                          : setNewProduct({ ...newProduct, preparationTimeMinutes: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    {productImagePreview && (
                      <div className="mb-3">
                        <img 
                          src={productImagePreview} 
                          alt="Preview" 
                          className="h-48 w-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload image to S3. Images will be publicly accessible.
                    </p>
                  </div>

                  {/* Optional URL input as fallback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only use if not uploading a file
                    </p>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct ? editingProduct.isAvailable : newProduct.isAvailable}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })
                          : setNewProduct({ ...newProduct, isAvailable: e.target.checked })
                        }
                        className="w-5 h-5 text-orange-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Available for order</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        resetProductForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingProductImage}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {uploadingProductImage ? "Uploading..." : editingProduct ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  {selectedCategory
                    ? "No products in this category yet."
                    : "No products yet. Create your first product to get started!"}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {product.images && product.images.length > 0 && (
                      <div className="h-48 bg-gray-200">
                        <S3Image
                          path={product.images[0]}
                          alt={product.nameEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{product.nameEn}</h3>
                          <p className="text-sm text-gray-600">{product.nameAr}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            product.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      {product.descriptionEn && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.descriptionEn}
                        </p>
                      )}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-orange-600">
                          {product.price.toFixed(3)} KWD
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.preparationTimeMinutes} min
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
