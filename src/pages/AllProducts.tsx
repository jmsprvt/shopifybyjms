import { FC, useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { addCategories, addProducts } from "../redux/features/productSlice";
import ProductCard from "../components/ProductCard";
import { Product } from "../models/Product";

const AllProducts: FC = () => {
  const dispatch = useAppDispatch();
  const [category, setCategory] = useState("all");
  const sortRef = useRef<HTMLSelectElement>(null);
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Состояние для ширины окна

  const allProducts = useAppSelector(
    (state) => state.productReducer.allProducts
  );
  const allCategories = useAppSelector(
    (state) => state.productReducer.categories
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // Обновляем ширину окна при изменении размера
    };

    window.addEventListener("resize", handleResize); // Добавляем обработчик события resize

    return () => {
      window.removeEventListener("resize", handleResize); // Удаляем обработчик события при размонтировании компонента
    };
  }, []);

  useEffect(() => {
    const fetchProducts = () => {
      fetch("https://dummyjson.com/products?limit=100")
        .then((res) => res.json())
        .then(({ products }) => {
          dispatch(addProducts(products));
        });
    };
    const fetchCategories = () => {
      fetch("https://dummyjson.com/products/categories")
        .then((res) => res.json())
        .then((data) => {
          dispatch(addCategories(data));
        });
    };
    if (allProducts.length === 0) fetchProducts();
    if (allCategories.length === 0) fetchCategories();
  }, [allProducts, allCategories, dispatch]);

  useEffect(() => {
    setCurrentProducts(allProducts);
  }, [allProducts]);

  useEffect(() => {
    if (category !== "all") {
      const updated = allProducts.filter((pro) => pro.category === category);
      setCurrentProducts(updated);
    }
  }, [category, allProducts]);

  const sortProducts = (sortValue: string) => {
    if (sortValue === "asc") {
      setCurrentProducts(
        [...currentProducts].sort((a, b) => {
          const aPrice =
            a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
          const bPrice =
            b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
          return aPrice - bPrice;
        })
      );
    } else if (sortValue === "desc") {
      setCurrentProducts(
        [...currentProducts].sort((a, b) => {
          const aPrice =
            a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
          const bPrice =
            b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
          return bPrice - aPrice;
        })
      );
    } else if (sortValue === 'stock') {
      setCurrentProducts([...currentProducts].sort((a, b) => {
        const aStock = a.stock ? a.stock : 0;
        const bStock = b.stock ? b.stock : 0;
        return bStock - aStock;
      }));
    } else if (sortValue === 'name') {
      setCurrentProducts([...currentProducts].sort((a, b) => a.title.localeCompare(b.title)));
    } else {
      setCurrentProducts([...currentProducts].sort((a, b) => a.id - b.id));
    }
  };

  return (
    <div className='container mx-auto min-h-[83vh] p-4 font-karla'>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
        <div className={`md:col-span-1 ${windowWidth >= 768 ? '' : 'hidden md:block'}`}>
          <h1 className="font-bold mb-2">Categories</h1>
          <div className="space-y-1">
            {allCategories.map((_category) => (
              <div
                key={_category}
                className={`cursor-pointer hover:text-blue-500 ${
                  _category === category ? "text-blue-500" : ""
                }`}
                onClick={() => {
                  setCategory(_category);
                  if (sortRef && sortRef.current)
                    sortRef.current.value = "default";
                  sortProducts("default");
                }}
              >
                {_category}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4 space-y-4 md:col-start-2 md:col-span-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-lg ${windowWidth >= 768 ? '' : 'hidden md:block'}`}>
              <span>Products</span>
              <span> {">"} </span>
              <span className="font-bold">{category}</span>
            </div>
            <select
              ref={sortRef}
              className={`border border-black rounded p-1 ${windowWidth >= 768 ? '' : 'text-center'}`}
              onChange={(e) => sortProducts(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="asc">Price (low to high)</option>
              <option value="desc">Price (high to low)</option>
              <option value="stock">Stock</option>
              <option value="name">Name</option> 
            </select>
          </div>
          <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;