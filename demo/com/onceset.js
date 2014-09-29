/** @jsx React.DOM */
module.exports = React.createClass({
  getInitialState: function() {
    return this.props.obj
  },
  handleAdd: function(e) {
    var v = this.refs.entry.getDOMNode().value
    if (!v) return
        
    this.props.obj.oset.push(v)
    this.props.onChange('green', 'onceset: add '+v)

    this.refs.entry.getDOMNode().value = ''
    this.setState(this.props.obj)
  },
  handleRemove: function(e) {
    var i = e.target.dataset.index
    if (i == void 0) return

    var v = this.props.obj.oset[i]
    this.props.obj.oset.splice(i, 1)
    this.props.onChange('red', 'onceset: remove '+v)

    this.setState(this.props.obj)        
  },
  render: function() {
    var values = this.props.obj.oset.map(function(v, i) {
      return <li key={('oset'+i)}>{v} <button onClick={this.handleRemove} data-index={i}>remove</button></li>
    }.bind(this))
    return <div className="onceset set field">
      Onceset<br/>
      <ul>{values}</ul>
      <input type="text" ref="entry" />
      <button onClick={this.handleAdd}>add</button>
    </div>;
  }
})