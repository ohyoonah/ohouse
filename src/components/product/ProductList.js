import styled from "styled-components";
import { useRef, useCallback } from "react";
import { useInfiniteQuery } from "react-query";
import axios from "axios";
import ProductItem from "./ProductItem";

const ProductListBlock = styled.div`
  padding: 0 4rem;
  max-width: 1256px;
  margin: 5rem auto;
  justify-content: space-between;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h2 {
      letter-spacing: -2px;
      font-size: 1.3rem;
    }
    span {
      color: var(--red);
      cursor: pointer;
      font-weight: 700;
      &:hover {
        color: var(--light-red);
      }
    }
  }
  .items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  @media only screen and (max-width: 1256px) {
    padding: 0 3rem;
  }
  @media only screen and (max-width: 1024px) {
    padding: 0 1.5rem;
  }
  @media only screen and (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SelectBlock = styled.select`
  border: none;
  outline: none;
  width: 100px;
`;

const ProductList = () => {
  const getItemPage = async (pageParam = 1) => {
    const { data } = await axios.get(
      `store/category.json?v=2&order=popular&page=${pageParam}&per=24`
      // "/api/getStoreApi"
    );
    return data.selected_products;
  };

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    status,
    error,
  } = useInfiniteQuery("items", ({ pageParam = 1 }) => getItemPage(pageParam), {
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : undefined;
    },
  });

  const intObserver = useRef();
  const lastItemRef = useCallback(
    (item) => {
      if (isFetchingNextPage) return;
      if (intObserver.current) intObserver.current.disconnect();
      intObserver.current = new IntersectionObserver((items) => {
        if (items[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (item) intObserver.current.observe(item);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (status === "error")
    return <p className="center">Error: {error.message}</p>;

  const content = data?.pages.map((pg) => {
    return pg.map((item, index) => {
      if (pg.length === index + 1) {
        return <ProductItem ref={lastItemRef} key={index} item={item} />;
      }
      return <ProductItem key={index} item={item} />;
    });
  });

  return (
    <ProductListBlock>
      <div className="title">
        <h2>????????????</h2>
        <SelectBlock defaultValue="2">
          <option key="1" value="1">
            ?????????
          </option>
          <option key="2" value="2">
            ?????????
          </option>
          <option key="3" value="3">
            ?????? ?????????
          </option>
          <option key="4" value="4">
            ???????????? ?????????
          </option>
          <option key="5" value="5">
            ???????????????
          </option>
          <option key="6" value="6">
            ???????????????
          </option>
          <option key="7" value="7">
            ?????????
          </option>
        </SelectBlock>
      </div>
      <div className="items">
        {content}
        {isFetchingNextPage && <p>Loading...</p>}
      </div>
    </ProductListBlock>
  );
};

export default ProductList;
