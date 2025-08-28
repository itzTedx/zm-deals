import Link from "next/link";

export const ProductSidebar = async () => {
  return (
    <div className="py-4">
      <h2 className="font-medium text-gray-500 text-xs">Mange Products</h2>
      <ul className="mt-4 flex flex-col gap-2 rounded-md bg-card p-2">
        <li>
          <Link
            className="block rounded-md bg-card p-2 font-medium text-gray-800 text-sm hover:text-gray-700"
            href="/studio/products"
          >
            Products
          </Link>
        </li>
        <li>
          <Link
            className="block rounded-md bg-card p-2 font-medium text-gray-800 text-sm hover:text-gray-700"
            href="/studio/products/categories"
          >
            Categories
          </Link>
        </li>
        <li>
          <Link
            className="block rounded-md bg-card p-2 font-medium text-gray-800 text-sm hover:text-gray-700"
            href="/studio/products/combo"
          >
            Combo Deals
          </Link>
        </li>
      </ul>
    </div>
  );
};
