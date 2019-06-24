export default () => {
  return {
    view() {
      return <div>
        <a
          className="btn btn-primary"
          data-toggle="collapse"
          href="#collapseExample"
          role="button"
          aria-expanded="false"
          aria-controls="collapseExample">
          Link with href
        </a>
        <button
          className="btn btn-primary"
          type="button"
          data-toggle="collapse"
          data-target="#collapseExample"
          aria-expanded="false"
          aria-controls="collapseExample">
          Button with data-target
        </button>
        <div className="collapse" id="collapseExample">
          <div className="card card-body">
          </div>
        </div>
      </div>;
    },
  };
};
