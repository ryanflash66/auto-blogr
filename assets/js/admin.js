/**
 * AutoBlogr AI Publisher - Admin JavaScript
 *
 * JavaScript functionality for the plugin admin interface.
 *
 * @package AutoBlogr
 * @since 1.0.0
 */

(function ($) {
  "use strict";

  /**
   * AutoBlogr Admin object.
   */
  var AutoBlogrAdmin = {
    /**
     * Initialize admin functionality.
     */
    init: function () {
      this.bindEvents();
      this.initComponents();
      this.checkConfiguration();
    },

    /**
     * Bind event handlers.
     */
    bindEvents: function () {
      // Test connection button.
      $(document).on(
        "click",
        ".autoblogr-test-connection",
        this.testConnection
      );

      // Retry failed tasks.
      $(document).on("click", ".autoblogr-retry-task", this.retryTask);

      // Settings form validation.
      $(document).on(
        "submit",
        "#autoblogr-settings-form",
        this.validateSettings
      );

      // Real-time validation.
      $(document).on("blur", "#callback_url", this.validateUrl);
      $(document).on("input", "#callback_api_key", this.toggleApiKeyVisibility);
    },

    /**
     * Initialize UI components.
     */
    initComponents: function () {
      // Initialize tooltips.
      this.initTooltips();

      // Initialize status refresh.
      this.initStatusRefresh();

      // Initialize clipboard functionality.
      this.initClipboard();
    },

    /**
     * Test API connection.
     */
    testConnection: function (e) {
      e.preventDefault();

      var $button = $(this);
      var $notice = $(".autoblogr-connection-notice");

      // Show loading state.
      $button.prop("disabled", true).text(autoblogr_admin.strings.testing);
      $notice.removeClass("notice-success notice-error").hide();

      // Prepare data.
      var data = {
        action: "autoblogr_test_connection",
        nonce: autoblogr_admin.nonce,
        callback_url: $("#callback_url").val(),
        callback_api_key: $("#callback_api_key").val(),
      };

      // Send AJAX request.
      $.post(autoblogr_admin.ajax_url, data)
        .done(function (response) {
          if (response.success) {
            $notice
              .addClass("notice-success")
              .html("<p>" + response.data.message + "</p>")
              .show();
          } else {
            $notice
              .addClass("notice-error")
              .html("<p>" + response.data.message + "</p>")
              .show();
          }
        })
        .fail(function () {
          $notice
            .addClass("notice-error")
            .html("<p>" + autoblogr_admin.strings.connection_failed + "</p>")
            .show();
        })
        .always(function () {
          $button
            .prop("disabled", false)
            .text(autoblogr_admin.strings.test_connection);
        });
    },

    /**
     * Retry a failed task.
     */
    retryTask: function (e) {
      e.preventDefault();

      var $link = $(this);
      var taskId = $link.data("task-id");
      var $row = $link.closest("tr");

      if (!taskId) {
        return;
      }

      // Show loading state.
      $row.addClass("autoblogr-loading");

      // Prepare data.
      var data = {
        action: "autoblogr_retry_task",
        nonce: autoblogr_admin.nonce,
        task_id: taskId,
      };

      // Send AJAX request.
      $.post(autoblogr_admin.ajax_url, data)
        .done(function (response) {
          if (response.success) {
            // Update row status.
            $row
              .find(".column-status")
              .html(
                '<span class="autoblogr-status status-queued">Queued</span>'
              );
            $row.find(".column-error").text("");

            // Show success notice.
            AutoBlogrAdmin.showNotice(response.data.message, "success");
          } else {
            AutoBlogrAdmin.showNotice(response.data.message, "error");
          }
        })
        .fail(function () {
          AutoBlogrAdmin.showNotice(
            autoblogr_admin.strings.retry_failed,
            "error"
          );
        })
        .always(function () {
          $row.removeClass("autoblogr-loading");
        });
    },

    /**
     * Validate settings form before submission.
     */
    validateSettings: function (e) {
      var isValid = true;
      var errors = [];

      // Validate callback URL.
      var callbackUrl = $("#callback_url").val();
      if (callbackUrl && !AutoBlogrAdmin.isValidUrl(callbackUrl)) {
        errors.push(autoblogr_admin.strings.invalid_callback_url);
        isValid = false;
      }

      // Validate HTTPS for callback URL.
      if (callbackUrl && !callbackUrl.startsWith("https://")) {
        errors.push(autoblogr_admin.strings.callback_url_https);
        isValid = false;
      }

      // Show validation errors.
      if (!isValid) {
        e.preventDefault();
        AutoBlogrAdmin.showNotice(errors.join("<br>"), "error");
        return false;
      }

      return true;
    },

    /**
     * Validate URL in real-time.
     */
    validateUrl: function () {
      var $input = $(this);
      var url = $input.val();
      var $feedback = $input.siblings(".url-feedback");

      // Remove existing feedback.
      $feedback.remove();

      if (url && !AutoBlogrAdmin.isValidUrl(url)) {
        $input.after(
          '<div class="url-feedback error">' +
            autoblogr_admin.strings.invalid_url +
            "</div>"
        );
      } else if (url && !url.startsWith("https://")) {
        $input.after(
          '<div class="url-feedback warning">' +
            autoblogr_admin.strings.url_https_recommended +
            "</div>"
        );
      }
    },

    /**
     * Toggle API key visibility.
     */
    toggleApiKeyVisibility: function () {
      var $input = $(this);
      var $toggle = $input.siblings(".toggle-visibility");

      if (!$toggle.length) {
        $input.after(
          '<button type="button" class="button toggle-visibility">' +
            autoblogr_admin.strings.show +
            "</button>"
        );
        $toggle = $input.siblings(".toggle-visibility");

        $toggle.on("click", function (e) {
          e.preventDefault();
          var isPassword = $input.attr("type") === "password";
          $input.attr("type", isPassword ? "text" : "password");
          $(this).text(
            isPassword
              ? autoblogr_admin.strings.hide
              : autoblogr_admin.strings.show
          );
        });
      }
    },

    /**
     * Check plugin configuration status.
     */
    checkConfiguration: function () {
      var $indicators = $(".autoblogr-config-item");

      $indicators.each(function () {
        var $item = $(this);
        var configKey = $item.data("config");
        var isConfigured = AutoBlogrAdmin.checkConfigValue(configKey);

        $item
          .toggleClass("configured", isConfigured)
          .toggleClass("not-configured", !isConfigured);

        var $icon = $item.find(".dashicons");
        $icon
          .toggleClass("dashicons-yes-alt", isConfigured)
          .toggleClass("dashicons-dismiss", !isConfigured);
      });
    },

    /**
     * Check if a configuration value is set.
     */
    checkConfigValue: function (key) {
      switch (key) {
        case "callback_url":
          return $("#callback_url").val().length > 0;
        case "callback_api_key":
          return $("#callback_api_key").val().length > 0;
        default:
          return false;
      }
    },

    /**
     * Initialize tooltips.
     */
    initTooltips: function () {
      $("[data-tooltip]").each(function () {
        var $element = $(this);
        var tooltip = $element.data("tooltip");

        $element
          .on("mouseenter", function () {
            var $tooltip = $(
              '<div class="autoblogr-tooltip">' + tooltip + "</div>"
            );
            $("body").append($tooltip);

            var offset = $element.offset();
            $tooltip.css({
              top: offset.top - $tooltip.outerHeight() - 5,
              left:
                offset.left +
                $element.outerWidth() / 2 -
                $tooltip.outerWidth() / 2,
            });
          })
          .on("mouseleave", function () {
            $(".autoblogr-tooltip").remove();
          });
      });
    },

    /**
     * Initialize status refresh functionality.
     */
    initStatusRefresh: function () {
      var $refreshButton = $(".autoblogr-refresh-status");

      if ($refreshButton.length) {
        $refreshButton.on("click", function (e) {
          e.preventDefault();
          location.reload();
        });

        // Auto-refresh every 30 seconds if there are pending tasks.
        if ($(".status-queued, .status-processing").length > 0) {
          setTimeout(function () {
            location.reload();
          }, 30000);
        }
      }
    },

    /**
     * Initialize clipboard functionality.
     */
    initClipboard: function () {
      $(".autoblogr-copy").on("click", function (e) {
        e.preventDefault();

        var $button = $(this);
        var text =
          $button.data("copy") || $button.prev("input, textarea").val();

        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            AutoBlogrAdmin.showNotice(
              autoblogr_admin.strings.copied,
              "success",
              2000
            );
          });
        } else {
          // Fallback for older browsers.
          var $temp = $("<textarea>").val(text).appendTo("body").select();
          document.execCommand("copy");
          $temp.remove();
          AutoBlogrAdmin.showNotice(
            autoblogr_admin.strings.copied,
            "success",
            2000
          );
        }
      });
    },

    /**
     * Show admin notice.
     */
    showNotice: function (message, type, timeout) {
      var $notice = $(
        '<div class="notice notice-' +
          type +
          ' is-dismissible autoblogr-temp-notice"><p>' +
          message +
          "</p></div>"
      );
      $(".wrap h1").after($notice);

      // Auto-dismiss after timeout.
      if (timeout) {
        setTimeout(function () {
          $notice.fadeOut(function () {
            $(this).remove();
          });
        }, timeout);
      }

      // Handle dismiss button.
      $notice.find(".notice-dismiss").on("click", function () {
        $notice.remove();
      });
    },

    /**
     * Validate URL format.
     */
    isValidUrl: function (url) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  /**
   * Initialize when document is ready.
   */
  $(document).ready(function () {
    AutoBlogrAdmin.init();
  });

  /**
   * Export to global scope for external access.
   */
  window.AutoBlogrAdmin = AutoBlogrAdmin;
})(jQuery);
