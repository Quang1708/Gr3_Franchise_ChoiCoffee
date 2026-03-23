const ClientLoading = () => {
  return (
    <main className="fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-md">
      <section className="relative w-full max-w-sm mx-4 p-10 backdrop-blur-xl text-center flex flex-col items-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-wider text-primary">
            Choi Coffee
          </h1>
          <div className="h-1 w-12 bg-primary mx-auto mt-1"></div>
        </div>
        <div className="relative mb-8">
          <div className="flex justify-center mb-2">
            <span className="steam" style={{ animationDelay: "0s" }}></span>
            <span className="steam" style={{ animationDelay: "0.5s" }}></span>
            <span className="steam" style={{ animationDelay: "1s" }}></span>
          </div>
          <div className="relative w-80px m-0-auto">
            <div className="coffee-cup-container">
              <div className="coffee-liquid"></div>
            </div>
            <div className="coffee-cup-handle"></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ClientLoading;
