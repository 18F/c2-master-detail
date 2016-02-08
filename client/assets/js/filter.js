$('[selectize]').selectize({
  plugins: ['remove_button'],
  persist: false,
  create: true,
  render: {
    item: function(data, escape) {
      return '<div>"' + escape(data.text) + '"</div>';
    }
  },
  onDelete: function(values) {
    console.log('Deleted ', values)
  }
});
