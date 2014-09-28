/** @jsx React.DOM */
var eco = require('../lib')
var tutil = require('../test/test-utils')
var Object = require('./com/object')
var SyncButton = require('./com/sync-button')

var dbs = window.dbs = []
var feeds = window.feeds = []
var ecos = window.ecos = []
var changes = window.changes = []

function setup() {
    dbs.push(tutil.makedb()); dbs.push(tutil.makedb())    
    feeds.push(tutil.makefeed()); feeds.push(tutil.makefeed())

    // create the object
    eco.create(dbs[0], feeds[0], {members:[feeds[0].id,feeds[1].id]}, function(err, obj) {
        if (err) throw err
        obj.declare({ counter: 'counter', reg: 'register', gset: 'growset', oset: 'onceset', orset: 'set' }, function(err, changes) {
            if (err) throw err

            // open the object replica
            feeds[0].msgs.forEach(feeds[1].addExisting.bind(feeds[1]))
            eco.open(dbs[1], feeds[1], obj.getId(), function(err, obj2) {
                if (err) throw err
                obj2.applyMessages(feeds[1].msgs.slice(1), function(err, changes) {
                    if (err) throw err

                    ecos.push(obj); changes.push([])
                    ecos.push(obj2); changes.push([])
                    render()
                })
            })
        })
    })
}

var App = React.createClass({
    dirtyStates: [],
    getInitialState: function() {
        return { canSync: true }
    },
    onDirty: function(i, dirty) {
        this.dirtyStates[i] = dirty
        var anyDirty = this.dirtyStates.reduce(function(s, acc) { return (s || acc) })
        this.setState({ canSync: !anyDirty })
    },
    render: function() {
        var objectNodes = ecos.map(function(obj, i) {
            return (<Object obj={obj} onDirty={this.onDirty.bind(this, i)} key={('obj'+i)} />)
        }.bind(this))
        return <div>{objectNodes}<SyncButton canSync={this.state.canSync}/></div>
    }
})

function render() {
    React.renderComponent(<div><App/></div>, document.getElementById('app'))
}

setup()