import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const Package = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div>
        <h1>
          Packages
        </h1>
        <p>
          Coming Soon...
        </p>
      </div>
    </Suspense>
  );
};

export default Package;
