import handlebars from 'handlebars';

    export default function(template, names) {
        var group = {};
        names.forEach(function(name) {
            handlebars.registerHelper(name, function(options) {
                group[name] = options.fn();
            });
        });
        handlebars.compile(template)({});
        names.forEach(function(name) {
            handlebars.unregisterHelper(name);
        });

        return group;
    };
