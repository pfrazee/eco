/** @jsx React.DOM */
module.exports = React.createClass({
  getInitialState: function() {
    return this.props.obj
  },
  handleAdd: function(e) {
    var v = this.refs.entry.getDOMNode().value
    if (!v) return

    this.props.obj.orset.push(v)
    this.props.onChange('green', 'set: add '+v)

    this.refs.entry.getDOMNode().value = ''
    this.setState(this.props.obj)
  },
  handleRemove: function(e) {
    var i = e.target.dataset.index
    if (i == void 0) return

    var v = this.props.obj.orset[i]
    this.props.obj.orset.splice(i, 1)
    this.props.onChange('red', 'set: remove '+v)
        
    this.setState(this.props.obj)
  },
  render: function() {
    var values = this.props.obj.orset.map(function(v, i) {
      return <li key={('orset'+i)}>{v} <button onClick={this.handleRemove} data-index={i}>remove</button></li>
    }.bind(this))
    return <div className="orset set field">
      Set<br/>
      <ul>{values}</ul>
      <input type="text" ref="entry" />
      <button onClick={this.handleAdd}>add</button>
    </div>
  }
})