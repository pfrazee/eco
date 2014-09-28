/** @jsx React.DOM */
var eco = require('../lib')
var Counter = require('./com/counter')
var Register = require('./com/register')
var Growset = require('./com/growset')
var Onceset = require('./com/onceset')
var Set = require('./com/set')

var objects = [
    {counter: 0, reg: 'foo', gset: ['a'], oset: ['apple'], orset: ['orange'] },
    {counter: 1, reg: 'bar', gset: ['b', 'c'], oset: [], orset: [] }
]
window.objects = objects

var Object = React.createClass({
    getInitialState: function() {
        return { changes: [] }
    },
    onChange: function(color, text) {
        this.state.changes.push({ color: color, text: text })
        this.setState(this.state)
    },
    handleCommit: function() {
        // TODO commit eco
        this.setState({ changes: [] })
    },
    render: function() {
        var changes = this.state.changes.map(function(change, i) {
            return <div key={i} style={({color: change.color})}>{change.text}</div>
        })
        return <div className="object">
            <Counter  obj={this.props.obj} key="counter" onChange={this.onChange} />
            <Register obj={this.props.obj} key="reg"     onChange={this.onChange} />
            <Growset  obj={this.props.obj} key="gset"    onChange={this.onChange} />
            <Onceset  obj={this.props.obj} key="oset"    onChange={this.onChange} />
            <Set      obj={this.props.obj} key="orset"   onChange={this.onChange} />
            {changes}
            <button onClick={this.handleCommit}>commit changes</button>
        </div>
    }
})
var objectNodes = objects.map(function(obj, i) {
    return (<Object obj={obj} key={('obj'+i)} />)
})

React.renderComponent(
    <div>
        {objectNodes}
        <button>Add replica</button>
    </div>,
    document.getElementById('app')
)

