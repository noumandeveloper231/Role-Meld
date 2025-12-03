import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const SavedJobs = React.lazy(() => import("../../components/"));

const Package = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SavedJobs />
    </Suspense>
  );
};

export default Package;
