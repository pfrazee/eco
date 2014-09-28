/** @jsx React.DOM */
var Counter = require('./counter')
var Register = require('./register')
var Growset = require('./growset')
var Onceset = require('./onceset')
var Set = require('./set')

module.exports = React.createClass({
    getInitialState: function() {
        return { changes: [], data: this.props.obj.get() }
    },
    onChange: function(color, text) {
        this.state.changes.push({ color: color, text: text })
        this.setState(this.state)
        this.props.onDirty(true)
    },
    handleCommit: function() {
        this.props.obj.put(this.state.data, function(err) {
            if (err) throw err
            this.setState({ changes: [], data: this.props.obj.get() })
            this.props.onDirty(false)
        }.bind(this))
    },
    render: function() {
        var changes = this.state.changes.map(function(change, i) {
            return <div key={i} style={({color: change.color})}>{change.text}</div>
        })
        var commitButton = (this.state.changes.length) ?
            <button onClick={this.handleCommit}>commit changes</button> :
            <button onClick={this.handleCommit} disabled>commit changes</button>
        return <div className="object">
            <Counter  obj={this.state.data} key="counter" onChange={this.onChange} />
            <Register obj={this.state.data} key="reg"     onChange={this.onChange} />
            <Growset  obj={this.state.data} key="gset"    onChange={this.onChange} />
            <Onceset  obj={this.state.data} key="oset"    onChange={this.onChange} />
            <Set      obj={this.state.data} key="orset"   onChange={this.onChange} />
            {changes} {commitButton}
        </div>
    }
})