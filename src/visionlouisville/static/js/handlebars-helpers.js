/*globals Handlebars $ _ moment */

var VisionLouisville = VisionLouisville || {};

(function(NS) {
  Handlebars.registerHelper('if_authenticated', function(options) {
    return !!NS.currentUserData ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('if_in_group', function(groupName, options) {
    var user = NS.app.currentUser;
    return (user.isAuthenticated() && user.isInGroup(groupName) ? options.fn(this) : options.inverse(this));
  });

  Handlebars.registerHelper('if_is_moment', function(options) {
    return (this.id.toString().slice(0,6) === 'moment') ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('if_supported', function(options) {
    var userId, supportingIds;

    if (!NS.currentUserData) {
      return options.inverse(this);
    }

    userId = NS.currentUserData.id;
    supportingIds = _.pluck(this.supporters, 'id');
    return _.contains(supportingIds, userId) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('if_shared', function(options) {
    var userId, sharingIds;

    if (!NS.currentUserData) {
      return options.inverse(this);
    }

    userId = NS.currentUserData.id;
    sharingIds = _.pluck(this.sharers, 'id');
    return _.contains(sharingIds, userId) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('CONTEXT', function() {
    return JSON.stringify(this);
  });

  Handlebars.registerHelper('STATIC_URL', function() {
    return NS.staticURL;
  });

  Handlebars.registerHelper('LOGIN_URL', function(redirectTo, options) {
    if (arguments.length === 1) {
      options = redirectTo;
      redirectTo = undefined;
    }
    return NS.getLoginUrl(redirectTo);
  });

  Handlebars.registerHelper('CSRF_TOKEN', function(options) {
    return NS.Utils.getCookie('csrftoken');
  });

  // TODO: Move this into the config
  function getTweetText (vision) {
    var visionUrl = window.location.toString(),
        username = vision.author_details.username,
        urlLength = NS.twitterConf.short_url_length,

        attribution = ' —@' + username + ' ',
        visionLength = 140 - attribution.length - urlLength - 2;
    return '"' + NS.Utils.truncateChars(vision.text, visionLength, '…') + '"' + attribution + visionUrl;
  }

  function linebreaks(text) {
    return text.replace(/\n/g, '<br />');
  }

  Handlebars.registerHelper('category_prompt', function(category) {
    return NS.Config.categories[category].prompt;
  });

  Handlebars.registerHelper('window_location', function() {
    return window.location.toString();
  });

  Handlebars.registerHelper('truncated_window_location', function(maxLength) {
    return NS.Utils.truncateChars(window.location.toString(), maxLength);
  });

  // usage: {{pluralize collection.length 'quiz' 'quizzes'}}
  Handlebars.registerHelper('pluralize', function(number, single, plural) {
    return (number === 1) ? single : plural;
  });

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
  });

  Handlebars.registerHelper('formatdatetime', function(datetime, format) {
    if (datetime) {
      return moment(datetime).format(format);
    }
    return '';
  });

  Handlebars.registerHelper('select', function(value, options) {
    var $el = $('<div/>').html(options.fn(this)),
      selectValue = function(v) {
        $el.find('[value="'+v+'"]').attr({
          checked: 'checked',
          selected: 'selected'
        });
      };

    if (_.isArray(value)) {
      _.each(value, selectValue);
    } else {
      selectValue(value);
    }

    return $el.html();
  });

  // Handlebars is presumed, but you could swap out
  var ESCAPE_EXPRESSION_FUNCTION = Handlebars.Utils.escapeExpression;
  var MARKSAFE_FUNCTION = function(str) { return new Handlebars.SafeString(str); };

  function formatTextForHTML(content, options) {
    // Start by escaping expressions in the content to make them safe.
    var safeContent = ESCAPE_EXPRESSION_FUNCTION(content);
    options = _.defaults(options || {}, {links: true, wrap: true});
    if (options.links) {
      safeContent = NS.Utils.linkify(safeContent);
      safeContent = NS.Utils.twitterify(safeContent);
    }
    if (options.wrap) {
      safeContent = NS.Utils.wrapify(safeContent);
    }
    return MARKSAFE_FUNCTION(safeContent); // Mark our string as safe, since it is.
  }

  Handlebars.registerHelper('formattext', formatTextForHTML);
  Handlebars.registerHelper('truncatechars', NS.Utils.truncateChars);

  Handlebars.registerHelper('TWEET_TEXT', getTweetText);
  Handlebars.registerHelper('SAFE_TWEET_TEXT', _.compose(formatTextForHTML, getTweetText));

  Handlebars.registerHelper('formattruncated', function(content, maxLength) {
    content = NS.Utils.truncateChars(content, maxLength);
    return formatTextForHTML(content, {links: false});
  });

}(VisionLouisville));
