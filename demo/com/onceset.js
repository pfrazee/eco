/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return this.props.obj
    },
    handleAdd: function(e) {
        this.props.obj[this.props.key].push(this.refs.entry.getDOMNode().value)
        this.refs.entry.getDOMNode().value = ''
        this.setState(this.props.obj)
    },
    handleRemove: function(e) {
        var i = e.target.dataset.index
        if (i == void 0) return
        this.props.obj[this.props.key].splice(i, 1)
        this.setState(this.props.obj)        
    },
    render: function() {
        var values = this.props.obj[this.props.key].map(function(v, i) {
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