BOWER_FLAGS=

ifeq ($(APP_ENVIRONMENT),prod)
	BOWER_FLAGS+=--production
endif

all: assets

assets: src/AppBundle/Resources/public/lib

src/AppBundle/Resources/public/lib: bower.json
	bower install $(BOWER_FLAGS)

.PHONY: all assets
