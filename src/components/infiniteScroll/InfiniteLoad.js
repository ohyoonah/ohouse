import styled from "styled-components";
import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery } from "react-query";
import axios from "axios";
import InfiniteItem from "./InfiniteItem";

const InfiniteBlock = styled.div`
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
  .content {
    width: 25%;
  }
  @media only screen and (max-width: 1256px) {
    padding: 0 3rem;
  }
  @media only screen and (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const InfiniteLoad = () => {
  const getItemPage = async (page = 1, options = {}) => {
    const res = await axios.get(
      `/store/category.json?v=2&order=popular&page=${page}`,
      options
    );
    return res.data.selected_products;
  };

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    status,
    error,
  } = useInfiniteQuery("/items", ({ page = 1 }) => getItemPage(page), {
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : undefined;
    },
  });

  const intObserver = useRef();
  const lastPostRef = useCallback(
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
    return pg.map((item, i) => {
      if (pg.length === i + 1) {
        return (
          // <div className="items">
          <InfiniteItem ref={lastPostRef} key={i} item={item} />
          // </div>
        );
      }
      return (
        // <div className="items">
        <InfiniteItem key={i} item={item} />
        // </div>
      );
    });
  });

  return (
    <InfiniteBlock>
      <div className="title">
        <h2>인기상품</h2>
        <span>더보기</span>
      </div>
      <div className="items">
        <div className="content">{content}</div>
        {isFetchingNextPage && <p>Loading...</p>}
      </div>
    </InfiniteBlock>
  );
};

export default InfiniteLoad;
