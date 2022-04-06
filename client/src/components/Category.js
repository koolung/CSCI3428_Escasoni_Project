const Category = ({ category, setCategoryValue }) => {

  function getData(val) {
    if (val.target.value.charAt(val.target.value.length - 1) === "~") {
      val.target.value = val.target.value.slice(0, -1) + "ɨ";
    }

  }

  return (
    <div className="Category">
      <label className="CategoryTitle">{category.title}</label>
      <input
        type="text"
        onChange={getData}
        onBlur={(e) => setCategoryValue(e.target.value, category.title)}
      />
    </div>
  );
};

export default Category;
