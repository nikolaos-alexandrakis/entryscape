import './index.scss';

export default () => ({
  view() {
    return (
      <div className="spinner__wrapper">
        <i className="fas fa-spinner fa-pulse" />
      </div>
    );
  },
});
